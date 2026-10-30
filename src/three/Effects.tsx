import { Bloom, EffectComposer } from '@react-three/postprocessing';

/** Neon bloom. Only mounted on capable devices with the bloom toggle on. */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.9} luminanceThreshold={0.08} luminanceSmoothing={0.4} mipmapBlur />
    </EffectComposer>
  );
}
