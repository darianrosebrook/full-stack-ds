import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Card, CardMedia, CardContent, Image, Input, Text, Icon, Progress } from '../../../packages/ds-react/src/components';
import { Stack } from '../../../packages/ds-react/src/primitives';
import '../../../packages/ds-tokens/generated/tokens.css';
import { artwork, studies } from './artwork';
import './theme.css';

const page = new URLSearchParams(location.search).get('page') ?? 'spotify';

function Search({value, onChange}: {value:string; onChange:(v:string)=>void}) {
  return <Stack variant="horizontal" className="search-region">
    <Icon name="search"/><Input ariaLabel="Search collection" placeholder="Search your inspiration" value={value} onChange={onChange}/>
  </Stack>;
}

function Spotify() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [category, setCategory] = useState('All');
  const shown = studies.map((study,index)=>({...study,index})).filter(s=>s.title.toLowerCase().includes(query.toLowerCase()));
  const current = studies[selected];
  return <main className="retoken spotify">
    <div className="music-shell">
      <aside className="library">
        <Stack className="home-links">
          <Text as="h1" weight="bold">Soundroom</Text>
          <Button className="quiet" onClick={()=>{setQuery('');setCategory('All');}}><Icon name="home"/> Home</Button>
        </Stack>
        <Stack className="library-body">
          <Stack variant="horizontal" className="section-heading"><Text weight="bold">Your Library</Text><Icon name="panel-left"/></Stack>
          <Stack variant="horizontal" className="pills">
            {['All','Playlists','Artists'].map(label=><Button key={label} size="small" ariaPressed={category===label} className={category===label?'selected':'quiet'} onClick={()=>setCategory(label)}>{label}</Button>)}
          </Stack>
          <Text className="muted">{category === 'All' ? 'Recently played' : category}</Text>
          {studies.slice(0,7).map((study,index)=><div className="library-row" key={study.title}>
            <div className="thumb"><Image src={artwork(index)} alt="" width={48} height={48} objectFit="cover" radius="sm"/></div>
            <div><Button className="quiet row-title" onClick={()=>setSelected(index)}>{category==='Artists'?study.maker:study.title}</Button><Text className="muted small">{category==='Artists'?'Artist':`Playlist · ${study.maker}`}</Text></div>
          </div>)}
        </Stack>
      </aside>
      <section className="discovery" aria-label="Music discovery">
        <Stack variant="horizontal" className="topbar"><Search value={query} onChange={setQuery}/><Button className="quiet" ariaLabel="Switch to image feed" onClick={()=>{location.search='?page=pinterest';}}><Icon name="panel-right"/></Button></Stack>
        <Text as="h2" weight="bold" className="page-title">Good morning</Text>
        <div className="quick-picks">{studies.slice(0,6).map((study,index)=><div className="quick-pick" key={study.title}>
          <Image src={artwork(index)} alt="" width={56} height={56} objectFit="cover"/>
          <Button className="quiet" onClick={()=>{setSelected(index);setPlaying(true);}}>{study.title}</Button>
        </div>)}</div>
        <Stack variant="horizontal" className="section-heading"><Text as="h2" weight="bold" className="section-title">Made for your morning</Text><Text className="muted small">Original studio mixes</Text></Stack>
        <div className="album-grid">{shown.slice(0,8).map(study=><Card className="album" key={study.title}>
          <CardMedia><Image size="full" src={artwork(study.index)} alt={`${study.title} cover`} aspectRatio="square" objectFit="cover" objectPosition="50% 35%"/></CardMedia>
          <CardContent><Button className="quiet album-title" onClick={()=>{setSelected(study.index);setPlaying(true);}}>{study.title}</Button><Text className="muted small">{study.maker}</Text></CardContent>
        </Card>)}</div>
        {shown.length===0&&<Text role="status">No mixes found</Text>}
      </section>
      <aside className="now-playing" aria-label="Now playing">
        <Stack variant="horizontal" className="section-heading"><Text weight="bold">Now playing</Text><Icon name="more-horizontal"/></Stack>
        <Image size="full" radius="md" src={artwork(selected)} alt={`${current.title} artwork`} aspectRatio="square" objectFit="cover"/>
        <Text as="h2" weight="bold" className="section-title">{current.title}</Text><Text className="muted">{current.maker}</Text>
        <Card className="artist-note"><CardContent><Text weight="bold">Behind the mix</Text><Text className="muted">Quiet places, considered objects, and a little space to think. A collection of original visual studies.</Text></CardContent></Card>
      </aside>
    </div>
    <footer className="player">
      <div className="library-row"><Image src={artwork(selected)} alt="" width={48} height={48} objectFit="cover" radius="sm"/><div><Text weight="bold">{current.title}</Text><Text className="muted small">{current.maker}</Text></div></div>
      <Stack className="playback"><Stack variant="horizontal" className="transport"><Button className="quiet" ariaLabel="Previous mix" onClick={()=>setSelected((selected+11)%12)}><Icon name="arrow-left"/></Button><Button className="play-button" ariaPressed={playing} onClick={()=>setPlaying(!playing)}>{playing?'Pause':'Play'}</Button><Button className="quiet" ariaLabel="Next mix" onClick={()=>setSelected((selected+1)%12)}><Icon name="arrow-right"/></Button></Stack><div className="timeline"><Text className="small muted">1:24</Text><Progress value={36} label="Track position"/><Text className="small muted">3:54</Text></div></Stack>
      <Text className="muted small player-note" align="right">Visual playback preview</Text>
    </footer>
  </main>;
}

function Pinterest() {
  const [query,setQuery] = useState('');
  const [saved,setSaved] = useState<number[]>([]);
  const [onlySaved,setOnlySaved] = useState(false);
  const shown=studies.map((study,index)=>({...study,index})).filter(s=>(!onlySaved||saved.includes(s.index))&&`${s.title} ${s.maker}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="retoken pinterest">
    <header className="pin-header">
      <Text weight="bold" className="wordmark">Pinboard</Text>
      <Button ariaPressed={!onlySaved} className={!onlySaved?'selected':'quiet'} onClick={()=>setOnlySaved(false)}>Home</Button>
      <Button ariaPressed={onlySaved} className={onlySaved?'selected':'quiet'} onClick={()=>setOnlySaved(true)}>Saved ({saved.length})</Button>
      <Search value={query} onChange={setQuery}/>
      <Button className="quiet" ariaLabel="Switch to music page" onClick={()=>{location.search='?page=spotify';}}><Icon name="panel-left"/></Button>
    </header>
    <Stack className="feed-heading"><Text as="h1" weight="bold" className="section-title">{onlySaved?'Your saved ideas':'A little inspiration for today'}</Text><Text className="muted">Spaces, shapes, and slower days</Text></Stack>
    <div className="pin-feed">{shown.map(study=><div className="pin-placement" key={study.title}>
      <Card className="pin" data-testid={`pin-${study.index}`}>
        <CardMedia><Image size="full" src={artwork(study.index)} alt={study.title} aspectRatio={study.ratio} objectFit="cover" objectPosition="50% 30%"/></CardMedia>
        <CardContent><Text weight="bold">{study.title}</Text><Text className="muted small">{study.maker}</Text></CardContent>
      </Card>
      <div className="pin-action"><Button className="save-button" ariaLabel={`${saved.includes(study.index)?'Unsave':'Save'} ${study.title}`} ariaPressed={saved.includes(study.index)} onClick={()=>setSaved(saved.includes(study.index)?saved.filter(i=>i!==study.index):[...saved,study.index])}>{saved.includes(study.index)?'Saved':'Save'}</Button></div>
    </div>)}</div>
    {shown.length===0&&<Text className="empty-state" role="status">No ideas found</Text>}
  </main>;
}

createRoot(document.getElementById('root')!).render(page==='pinterest'?<Pinterest/>:<Spotify/>);
