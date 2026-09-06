/** Real generated components used for manual visual review and interaction checks. */
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, CardHeader, CardMedia, CardContent, CardActions, Button, Text, Input, Switch, Badge } from '../../packages/ds-react/src/components';

function Sample({id}: {id:string}) {
  const [checked,setChecked] = useState(false);
  const [saved,setSaved] = useState(false);
  return <Card interactive className="review-card">
    <CardMedia><div className="review-art" aria-label="Abstract color study" /></CardMedia>
    <CardHeader><Text as="h2" variant="title">A shared vocabulary</Text><Badge>Preview</Badge></CardHeader>
    <CardContent>
      <Text>Same component structure. Independently controlled surfaces, type, borders, and spacing.</Text>
      <Input ariaLabel={`${id} collection name`} placeholder="Collection name" />
      <Switch checked={checked} onChange={setChecked}>{id} notifications</Switch>
    </CardContent>
    <CardActions><Button variant="secondary" onClick={()=>setSaved(false)}>Reset</Button><Button onClick={()=>setSaved(true)}>{saved?'Saved':'Save'}</Button></CardActions>
  </Card>;
}
function Gallery() {
  return <main className="binding-review">
    <style>{`
      body { margin:0; background:#f2f3f5; color:#202125; font-family:system-ui,sans-serif; }
      .binding-review { max-width:1050px; padding:32px; margin:auto; }
      .review-columns { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
      .review-card { width:100%; }
      .review-art { height:150px; background:linear-gradient(130deg,#233b5d,#54ba99); }
      .review-card .input { width:100%; }
      .review-card h2, .review-card p { margin:0; }
      .retokened {
        --fsds-card-design-root-background-fill:#16262b;
        --fsds-card-design-condition-0e2417fefe62-background-fill:#1e343a;
        --fsds-text-design-root-foreground-color:#edf8f6;
        --fsds-card-design-root-foreground-color:#edf8f6;
        --fsds-card-design-header-foreground-color:#edf8f6;
        --fsds-card-design-content-foreground-color:#edf8f6;
        --fsds-card-design-root-border-width:0px;
        --fsds-card-design-root-shape-radius:24px;
        --fsds-card-design-media-shape-radius:16px;
        --fsds-card-design-root-spacing-padding:24px;
        --fsds-card-design-root-spacing-gap:18px;
        --fsds-card-design-content-spacing-gap:16px;
        --fsds-button-design-root-shape-radius:8px;
      }
    `}</style>
    <h1>Component design bindings</h1><p>Visual and interaction review of generated React components.</p>
    <div className="review-columns"><section><h2>Defaults</h2><Sample id="Default"/></section><section className="retokened"><h2>Consumer overrides</h2><Sample id="Retokened"/></section></div>
  </main>;
}
export function mount(host:HTMLElement) { createRoot(host).render(<Gallery/>); }
