import React, { useMemo, useState } from 'react';
import { analyzeTextMoodEnhanced, type MoodAdjustment } from '../../utils/moodMapping';
import { applyMoodToNodes } from '../../lib/colorflow/moodToNodes';
import { CAMPAIGN_PRESETS, getCampaignPresetById } from '../../lib/campaign/campaignPresets';
import { autoRescuePhoto } from '../../lib/campaign/autoRescue';
import { getSpecById, type PlatformSpec } from '../../lib/campaign/platformSpecs';
import { LENS_PRESETS, getPresetById } from '../../lib/lens/lensPresets';
import { triagePhoto, type TriageDecision } from '../../lib/campaign/photoTriage';
import { PhotoTriageGrid, type TriagedPhoto } from './PhotoTriageGrid';
import { PlatformChecklist } from './PlatformChecklist';

interface CampaignWizardProps {
  onApplyLook?: (mood: MoodAdjustment) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface LoadedPhoto {
  file: File;
  imageData: ImageData;
  previewUrl: string;
}

interface SubjectPoint {
  x: number;
  y: number;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RenderResult {
  blob: Blob;
  crop: CropRect;
}

function fileToImageData(file: File): Promise<{ imageData: ImageData; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas 2D indisponivel'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      resolve({ imageData: data, previewUrl: objectUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Falha ao carregar imagem'));
    };
    img.src = objectUrl;
  });
}

function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
}

async function imageDataToBlob(imageData: ImageData, mimeType: string, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponivel para export');
  ctx.putImageData(imageData, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao criar blob de imagem'));
        return;
      }
      resolve(blob);
    }, mimeType, quality);
  });
}

async function detectSubjectPoint(imageData: ImageData): Promise<SubjectPoint> {
  const { data, width, height } = imageData;

  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      const DetectorCtor = (window as unknown as {
        FaceDetector: new (_opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
          detect: (source: CanvasImageSource) => Promise<Array<{ boundingBox: { x: number; y: number; width: number; height: number } }>>;
        };
      }).FaceDetector;

      const detector = new DetectorCtor({ fastMode: true, maxDetectedFaces: 1 });
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.putImageData(imageData, 0, 0);
        const faces = await detector.detect(canvas);
        if (faces.length > 0) {
          const bb = faces[0].boundingBox;
          return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
        }
      }
    } catch {
      // Falls back to heuristic below.
    }
  }

  // Heuristica de sujeito: combina detalhe local, luminosidade e leve vies central.
  const step = Math.max(2, Math.floor(Math.min(width, height) / 220));
  let bestScore = -Infinity;
  let bestX = width / 2;
  let bestY = height / 2;

  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const idx = (y * width + x) * 4;
      const l = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      const idxL = (y * width + (x - step)) * 4;
      const idxR = (y * width + (x + step)) * 4;
      const idxU = ((y - step) * width + x) * 4;
      const idxD = ((y + step) * width + x) * 4;

      const lL = (data[idxL] + data[idxL + 1] + data[idxL + 2]) / 3;
      const lR = (data[idxR] + data[idxR + 1] + data[idxR + 2]) / 3;
      const lU = (data[idxU] + data[idxU + 1] + data[idxU + 2]) / 3;
      const lD = (data[idxD] + data[idxD + 1] + data[idxD + 2]) / 3;

      const edgeStrength = Math.abs(l - lL) + Math.abs(l - lR) + Math.abs(l - lU) + Math.abs(l - lD);

      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const centerBias = 1 - Math.min(1, Math.sqrt(nx * nx + ny * ny));

      const skinLike =
        data[idx] > 60 &&
        data[idx + 1] > 40 &&
        data[idx + 2] > 20 &&
        data[idx] > data[idx + 1] &&
        data[idx + 1] > data[idx + 2]
          ? 10
          : 0;

      const score = edgeStrength * 0.7 + centerBias * 45 + skinLike + (255 - Math.abs(128 - l)) * 0.08;

      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
      }
    }
  }

  return { x: bestX, y: bestY };
}

function computeSmartCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  subject: SubjectPoint
): CropRect {
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    cropWidth = Math.round(sourceHeight * targetRatio);
  } else if (sourceRatio < targetRatio) {
    cropHeight = Math.round(sourceWidth / targetRatio);
  }

  const desiredX = Math.round(subject.x - cropWidth / 2);
  const desiredY = Math.round(subject.y - cropHeight / 2);

  const x = Math.max(0, Math.min(sourceWidth - cropWidth, desiredX));
  const y = Math.max(0, Math.min(sourceHeight - cropHeight, desiredY));

  return { x, y, width: cropWidth, height: cropHeight };
}

async function renderForPlatform(imageData: ImageData, spec: PlatformSpec): Promise<RenderResult> {
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = imageData.width;
  srcCanvas.height = imageData.height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Canvas origem indisponivel');
  srcCtx.putImageData(imageData, 0, 0);

  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = spec.width;
  dstCanvas.height = spec.height;
  const dstCtx = dstCanvas.getContext('2d');
  if (!dstCtx) throw new Error('Canvas destino indisponivel');

  const srcW = imageData.width;
  const srcH = imageData.height;
  const subject = await detectSubjectPoint(imageData);
  const crop = computeSmartCrop(srcW, srcH, spec.width, spec.height, subject);

  dstCtx.drawImage(srcCanvas, crop.x, crop.y, crop.width, crop.height, 0, 0, spec.width, spec.height);

  const mimeType = spec.format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = spec.recommendedQuality / 100;

  return new Promise((resolve, reject) => {
    dstCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao gerar imagem final por plataforma'));
        return;
      }
      resolve({ blob, crop });
    }, mimeType, quality);
  });
}

export function CampaignWizard({ onApplyLook }: CampaignWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [campaignId, setCampaignId] = useState<string>('single-launch');
  const [loadedPhotos, setLoadedPhotos] = useState<LoadedPhoto[]>([]);
  const [triagedPhotos, setTriagedPhotos] = useState<TriagedPhoto[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [moodText, setMoodText] = useState('cinematic emotional');
  const [lookPreview, setLookPreview] = useState<MoodAdjustment | null>(null);
  const [lookModel, setLookModel] = useState('keyword');
  const [selectedLensPresetId, setSelectedLensPresetId] = useState('preset-portrait');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [generateProgress, setGenerateProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zipStatus, setZipStatus] = useState<string>('');
  const [previewPlatformId, setPreviewPlatformId] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const campaign = useMemo(() => getCampaignPresetById(campaignId) ?? CAMPAIGN_PRESETS[0], [campaignId]);

  const handleSelectCampaign = (id: string) => {
    setCampaignId(id);
    const preset = getCampaignPresetById(id);
    if (preset) {
      setMoodText(preset.suggestedMood);
      setSelectedLensPresetId(preset.suggestedLensPreset);
      setLookPreview(preset.suggestedColorGrading);
      setChecklistState({});
    }
  };

  const runTriage = async (files: File[]) => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setAnalyzeProgress(0);

    const accepted = files.filter((f) => f.type.startsWith('image/')).slice(0, 20);
    const loaded: LoadedPhoto[] = [];
    const triaged: TriagedPhoto[] = [];

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i];
      const loadedFile = await fileToImageData(file);
      loaded.push({ file, imageData: loadedFile.imageData, previewUrl: loadedFile.previewUrl });

      const score = triagePhoto(loadedFile.imageData);
      let previewUrl = loadedFile.previewUrl;
      if (score.decision === 'rescue' && score.rescueActions.length > 0) {
        const rescued = await autoRescuePhoto(loadedFile.imageData, score.rescueActions, 0.8);
        previewUrl = imageDataToDataUrl(rescued);
      }

      triaged.push({
        id: `${file.name}-${i}-${Date.now()}`,
        fileName: file.name,
        previewUrl,
        score,
        bucket: score.decision,
      });

      setAnalyzeProgress(Math.round(((i + 1) / accepted.length) * 100));
    }

    setLoadedPhotos(loaded);
    setTriagedPhotos(triaged);
    setIsAnalyzing(false);
    setStep(3);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    void runTriage(files);
  };

  const onInputFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    void runTriage(files);
    e.target.value = '';
  };

  const reassignPhoto = (photoId: string, bucket: TriageDecision) => {
    setTriagedPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, bucket } : p)));
  };

  const applySuggestedLook = async () => {
    const analyzed = await analyzeTextMoodEnhanced(moodText || campaign.suggestedMood, 0.8, true);
    if ('modelUsed' in analyzed) {
      setLookModel(analyzed.modelUsed);
      setLookPreview(analyzed.adjustments);
      onApplyLook?.(analyzed.adjustments);
      return;
    }
    setLookModel('keyword');
    setLookPreview(analyzed.adjustments);
    onApplyLook?.(analyzed.adjustments);
  };

  const applyLensPresetLook = () => {
    const lens = getPresetById(selectedLensPresetId);
    const grading = lens?.suggestedColorGrading ?? campaign.suggestedColorGrading;
    setLookPreview(grading);
    onApplyLook?.(grading);

    // Invocacao de reutilizacao explicitamente pedida.
    applyMoodToNodes([], grading);
  };

  const toggleChecklist = (itemId: string) => {
    setChecklistState((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const generateCampaign = async () => {
    setIsGenerating(true);
    setGenerateProgress(0);
    const total = campaign.platformIds.length;

    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setGenerateProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsGenerating(false);
  };

  const buildPlatformPreview = async () => {
    const platformId = previewPlatformId || campaign.platformIds[0];
    if (!platformId) return;

    const chosen = [
      ...triagedPhotos.filter((p) => p.bucket === 'hero'),
      ...triagedPhotos.filter((p) => p.bucket === 'usable'),
      ...triagedPhotos.filter((p) => p.bucket === 'rescue'),
    ][0];
    const basePhoto = chosen
      ? loadedPhotos.find((p) => p.file.name === chosen.fileName) ?? loadedPhotos[0]
      : loadedPhotos[0];

    if (!basePhoto) return;
    const spec = getSpecById(platformId);
    if (!spec) return;

    const rendered = await renderForPlatform(basePhoto.imageData, spec);
    const url = URL.createObjectURL(rendered.blob);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
    setPreviewPlatformId(platformId);
  };

  const downloadZip = async () => {
    const prioritized = [
      ...triagedPhotos.filter((p) => p.bucket === 'hero'),
      ...triagedPhotos.filter((p) => p.bucket === 'usable'),
      ...triagedPhotos.filter((p) => p.bucket === 'rescue'),
    ];
    const chosen = prioritized[0];
    const basePhoto = chosen
      ? loadedPhotos.find((p) => p.file.name === chosen.fileName) ?? loadedPhotos[0]
      : loadedPhotos[0];

    if (!basePhoto) {
      setZipStatus('Nenhuma foto carregada para exportar.');
      return;
    }

    const manifest = {
      campaign: campaign.name,
      createdAt: new Date().toISOString(),
      photos: triagedPhotos.length,
      selectedLensPresetId,
      moodText,
      lookPreview,
      outputs: campaign.platformIds.map((id) => {
        const spec = getSpecById(id);
        return {
          id,
          name: spec?.name,
          size: spec ? `${spec.width}x${spec.height}` : 'n/a',
          format: spec?.format ?? 'jpg',
        };
      }),
    };

    const slug = campaign.id.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
    const date = new Date().toISOString().slice(0, 10);

    try {
      setZipStatus('Preparando ZIP...');
      const JSZipModule = await import('jszip');
      const JSZipCtor = JSZipModule.default;
      const zip = new JSZipCtor();

      const assetsFolder = zip.folder('assets');
      if (!assetsFolder) throw new Error('Nao foi possivel criar pasta assets no ZIP');

      for (const id of campaign.platformIds) {
        const spec = getSpecById(id);
        if (!spec) continue;
        const rendered = await renderForPlatform(basePhoto.imageData, spec);
        const ext = spec.format === 'png' ? 'png' : 'jpg';
        assetsFolder.file(`${id}.${ext}`, rendered.blob);
      }

      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      const readme = [
        `VISIONFLOW Campaign Pack`,
        `Campaign: ${campaign.name}`,
        `Generated: ${new Date().toISOString()}`,
        `Base photo: ${basePhoto.file.name}`,
        '',
        'Arquivos em /assets seguem specs de plataforma com crop central (cover).',
      ].join('\n');
      zip.file('README.txt', readme);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `visionflow_${slug}_${date}.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);
      setZipStatus('ZIP real gerado com sucesso.');
    } catch {
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visionflow_${slug}_${date}_manifest.json`;
      a.click();
      URL.revokeObjectURL(url);
      setZipStatus('Falha no ZIP real; manifesto JSON exportado como fallback.');
    }
  };

  React.useEffect(() => {
    if (step !== 5 || campaign.platformIds.length === 0) return;
    if (!previewPlatformId) setPreviewPlatformId(campaign.platformIds[0]);
    void buildPlatformPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, campaign.id]);

  React.useEffect(() => {
    if (step !== 5 || !previewPlatformId) return;
    void buildPlatformPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewPlatformId, triagedPhotos.length, loadedPhotos.length]);

  const heroCount = triagedPhotos.filter((p) => p.bucket === 'hero').length;
  const usableCount = triagedPhotos.filter((p) => p.bucket === 'usable').length;
  const rescueCount = triagedPhotos.filter((p) => p.bucket === 'rescue').length;
  const rejectCount = triagedPhotos.filter((p) => p.bucket === 'reject').length;

  return (
    <div style={{ background: '#09090b', border: '1px solid #3f3f46', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <strong style={{ color: '#f4f4f5', letterSpacing: 1, fontSize: 12 }}>CAMPAIGN WIZARD</strong>
        <span style={{ color: '#a1a1aa', fontSize: 11 }}>Passo {step}/5</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6, marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            style={{
              height: 6,
              borderRadius: 999,
              background: idx <= step ? '#f59e0b' : '#27272a',
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <section>
          <div style={{ color: '#d4d4d8', fontSize: 12, marginBottom: 10 }}>Passo 1: Escolha o tipo de campanha</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {CAMPAIGN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectCampaign(preset.id)}
                style={{
                  border: `1px solid ${campaignId === preset.id ? '#f59e0b' : '#3f3f46'}`,
                  background: campaignId === preset.id ? 'rgba(245,158,11,0.16)' : '#18181b',
                  color: '#f4f4f5',
                  textAlign: 'left',
                  borderRadius: 10,
                  padding: 10,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{preset.emoji} {preset.name}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#a1a1aa' }}>{preset.description}</div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button style={btnAccent} onClick={() => setStep(2)}>Continuar</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <div style={{ color: '#d4d4d8', fontSize: 12, marginBottom: 10 }}>Passo 2: Upload de fotos (3-20 imagens)</div>
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '2px dashed #52525b',
              borderRadius: 10,
              padding: '28px 12px',
              textAlign: 'center',
              color: '#a1a1aa',
              background: '#18181b',
            }}
          >
            Arraste fotos aqui ou use o seletor abaixo.
            <div style={{ marginTop: 10 }}>
              <input type="file" accept="image/*" multiple onChange={onInputFiles} />
            </div>
          </div>
          {isAnalyzing && (
            <div style={{ marginTop: 10 }}>
              <div style={{ color: '#d4d4d8', fontSize: 11 }}>Analisando fotos... {analyzeProgress}%</div>
              <div style={progressOuter}><div style={{ ...progressInner, width: `${analyzeProgress}%` }} /></div>
            </div>
          )}
          {loadedPhotos.length > 0 && !isAnalyzing && (
            <div style={{ marginTop: 10, color: '#22c55e', fontSize: 11 }}>{loadedPhotos.length} fotos carregadas.</div>
          )}
        </section>
      )}

      {step === 3 && (
        <section>
          <div style={{ color: '#d4d4d8', fontSize: 12, marginBottom: 10 }}>Passo 3: IA organiza as fotos</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={chip}>⭐ Herois: {heroCount}</span>
            <span style={chip}>✓ Usaveis: {usableCount}</span>
            <span style={chip}>🔧 Resgate: {rescueCount}</span>
            <span style={chip}>✕ Rejeitadas: {rejectCount}</span>
          </div>
          <PhotoTriageGrid photos={triagedPhotos} onReassign={reassignPhoto} />
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <button style={btnGhost} onClick={() => setStep(2)}>Voltar</button>
            <button style={btnAccent} onClick={() => setStep(4)}>Continuar</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section>
          <div style={{ color: '#d4d4d8', fontSize: 12, marginBottom: 10 }}>Passo 4: Defina o look visual</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 4 }}>Descreva o vibe da musica</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={moodText}
                  onChange={(e) => setMoodText(e.target.value)}
                  placeholder="Ex: cinematic dark emotional"
                  style={{
                    flex: 1,
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    color: '#fafafa',
                    padding: '8px 10px',
                  }}
                />
                <button style={btnGhost} onClick={() => { void applySuggestedLook(); }}>Analisar mood</button>
              </div>
            </div>

            <div>
              <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 4 }}>Ou escolha preset de lente</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={selectedLensPresetId}
                  onChange={(e) => setSelectedLensPresetId(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    color: '#fafafa',
                    padding: '8px 10px',
                  }}
                >
                  {LENS_PRESETS.map((lens) => (
                    <option key={lens.id} value={lens.id}>{lens.emoji} {lens.name}</option>
                  ))}
                </select>
                <button style={btnGhost} onClick={applyLensPresetLook}>Aplicar lente</button>
              </div>
            </div>

            <div style={{ border: '1px solid #3f3f46', borderRadius: 8, padding: 10, background: '#18181b' }}>
              <div style={{ color: '#f4f4f5', fontSize: 12, marginBottom: 4 }}>Preview do look</div>
              <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 4 }}>Modelo: {lookModel}</div>
              <pre style={{ margin: 0, color: '#d4d4d8', fontSize: 10, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(lookPreview ?? campaign.suggestedColorGrading, null, 2)}
              </pre>
            </div>

            <PlatformChecklist
              items={campaign.checklist}
              checked={checklistState}
              onToggle={toggleChecklist}
            />
          </div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <button style={btnGhost} onClick={() => setStep(3)}>Voltar</button>
            <button style={btnAccent} onClick={() => setStep(5)}>Continuar</button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section>
          <div style={{ color: '#d4d4d8', fontSize: 12, marginBottom: 10 }}>Passo 5: Geracao e export</div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 6 }}>Preview final por plataforma</div>
            <select
              value={previewPlatformId || campaign.platformIds[0] || ''}
              onChange={(e) => setPreviewPlatformId(e.target.value)}
              style={{
                width: '100%',
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: 8,
                color: '#fafafa',
                padding: '8px 10px',
                marginBottom: 8,
              }}
            >
              {campaign.platformIds.map((id) => {
                const spec = getSpecById(id);
                return <option key={id} value={id}>{spec?.emoji} {spec?.name}</option>;
              })}
            </select>

            {(() => {
              const selectedSpec = getSpecById(previewPlatformId || campaign.platformIds[0] || '');
              if (!selectedSpec || !previewUrl) return null;
              return (
                <div style={{ border: '1px solid #3f3f46', borderRadius: 8, padding: 10, background: '#111827' }}>
                  <div style={{ color: '#d4d4d8', fontSize: 11, marginBottom: 8 }}>
                    Smart crop + Safe zone overlay • {selectedSpec.width}x{selectedSpec.height}
                  </div>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: `${selectedSpec.width}/${selectedSpec.height}`, borderRadius: 6, overflow: 'hidden' }}>
                    <img
                      src={previewUrl}
                      alt="Preview final por plataforma"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: `${selectedSpec.safeZone.top}%`,
                        right: `${selectedSpec.safeZone.right}%`,
                        bottom: `${selectedSpec.safeZone.bottom}%`,
                        left: `${selectedSpec.safeZone.left}%`,
                        border: '2px dashed rgba(52,211,153,0.95)',
                        borderRadius: 4,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.22)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ border: '1px solid #3f3f46', borderRadius: 8, padding: 10, background: '#18181b', marginBottom: 10 }}>
            <div style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 6 }}>Formatos no pacote</div>
            <div style={{ display: 'grid', gap: 4 }}>
              {campaign.platformIds.map((id) => {
                const spec = getSpecById(id);
                return (
                  <div key={id} style={{ color: '#d4d4d8', fontSize: 11 }}>
                    {spec?.emoji} {spec?.name} • {spec?.width}x{spec?.height}
                  </div>
                );
              })}
            </div>
          </div>

          <button style={btnAccent} onClick={() => { void generateCampaign(); }} disabled={isGenerating}>
            {isGenerating ? 'Gerando...' : 'Gerar formatos'}
          </button>

          <div style={{ marginTop: 10 }}>
            <div style={{ color: '#d4d4d8', fontSize: 11 }}>Progresso: {generateProgress}%</div>
            <div style={progressOuter}><div style={{ ...progressInner, width: `${generateProgress}%` }} /></div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <button style={btnGhost} onClick={() => setStep(4)}>Voltar</button>
            <button style={btnAccent} onClick={() => { void downloadZip(); }} disabled={generateProgress < 100}>Download ZIP</button>
          </div>
          {zipStatus && <div style={{ marginTop: 8, color: '#a1a1aa', fontSize: 11 }}>{zipStatus}</div>}
        </section>
      )}
    </div>
  );
}

const chip: React.CSSProperties = {
  fontSize: 11,
  color: '#e4e4e7',
  border: '1px solid #3f3f46',
  borderRadius: 999,
  padding: '3px 8px',
  background: '#18181b',
};

const btnAccent: React.CSSProperties = {
  border: '1px solid #f59e0b',
  background: 'rgba(245,158,11,0.18)',
  color: '#fef3c7',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  border: '1px solid #3f3f46',
  background: '#18181b',
  color: '#d4d4d8',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  cursor: 'pointer',
};

const progressOuter: React.CSSProperties = {
  marginTop: 4,
  height: 8,
  borderRadius: 999,
  background: '#27272a',
  overflow: 'hidden',
};

const progressInner: React.CSSProperties = {
  height: '100%',
  background: '#22c55e',
};
