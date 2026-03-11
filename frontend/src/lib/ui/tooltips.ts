export interface TooltipDef {
  short: string;
  learnMore: string;
}

export const TOOLTIPS: Record<string, TooltipDef> = {
  temperature: {
    short: 'Tom quente ou frio da imagem',
    learnMore: 'Positivo = luz dourada de entardecer. Negativo = frio de dia nublado ou noite.',
  },
  saturation: {
    short: 'Intensidade das cores',
    learnMore: 'Zero = preto e branco. Maximo = cores estouradas e vibrantes.',
  },
  contrast: {
    short: 'Diferenca entre claro e escuro',
    learnMore: 'Aumentar cria clima mais dramatico. Diminuir da look lavado e suave.',
  },
  vignette: {
    short: 'Bordas escurecidas',
    learnMore: 'Puxa o olhar para o centro. Classico em fotos de shows e retratos.',
  },
  sharpen: {
    short: 'Nitidez dos detalhes',
    learnMore: 'Realca texturas. Cuidado: excesso cria halo nas bordas.',
  },
  splitToning: {
    short: 'Cor nas sombras e nos brancos',
    learnMore: 'Sombras azuis + brancos dourados = look de cinema. E o que separa editado de profissional.',
  },
  grain: {
    short: 'Granulado de pelicula fotografica',
    learnMore: 'Da textura analogica. Fotos de shows ficam com cara de show de verdade.',
  },
  chromaticAberration: {
    short: 'Franjas coloridas nas bordas',
    learnMore: 'Imperfeicao optica de lentes antigas. Usado com intencao da look vintage unico.',
  },
  distortion: {
    short: 'Curvatura da imagem',
    learnMore: 'Grande angular curva as bordas. Teleobjetiva comprime a perspectiva.',
  },
  bokeh: {
    short: 'Desfoque de fundo artistico',
    learnMore: 'Mantem o sujeito nitido e embaca o fundo. Quanto mais aberta a lente, mais intenso.',
  },
  lightness: {
    short: 'Brilho geral da imagem',
    learnMore: 'Diferente de exposicao: move tudo junto, preservando parte do contraste.',
  },
  hue: {
    short: 'Rotacao das cores no espectro',
    learnMore: 'Pequenas mudancas sutilizam a paleta. Mudancas grandes criam efeitos criativos.',
  },
};
