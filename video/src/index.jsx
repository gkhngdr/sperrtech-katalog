import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Ad, FlowStart, FPS, DURATION } from './Ad.jsx';

// Instagram Reels / Hikâye: 9:16, 1080 × 1920, 30 kare/sn, 15 sn
const Root = () => (
  <>
    <Composition id="Flow-Baslangic" component={FlowStart} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    {['tr', 'en'].map((lang) => (
      <Composition key={lang} id={`AER22-${lang.toUpperCase()}`} component={Ad} width={1080} height={1920} fps={FPS} durationInFrames={DURATION} defaultProps={{ lang }} />
    ))}
  </>
);
registerRoot(Root);
