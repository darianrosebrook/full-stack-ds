import { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Card, CardMedia, CardContent, Image, Input, Text, Icon, Popover } from '../../../packages/ds-react/src/components';
import { Stack } from '../../../packages/ds-react/src/primitives';
import { pinArtwork, pins } from './pin-artwork';

function selectedFromUrl() {
  const value=new URLSearchParams(location.search).get('pin');
  if(value===null || !/^\d+$/.test(value)) return null;
  const index=Number(value);
  return index<pins.length?index:null;
}

export function Pinterest() {
  const [selected,setSelected]=useState<number|null>(selectedFromUrl);
  const [query,setQuery]=useState('');
  const [saved,setSaved]=useState<number[]>([]);
  const [liked,setLiked]=useState<number[]>([]);
  const [hidden,setHidden]=useState<number[]>([]);
  const [onlySaved,setOnlySaved]=useState(false);
  const [comments,setComments]=useState<Record<number,string[]>>({});
  const [draft,setDraft]=useState('');
  const [notice,setNotice]=useState('');
  const [boards,setBoards]=useState<Record<number,string>>({});
  const board=selected===null?'Design inspiration':boards[selected]??'Design inspiration';
  const [boardOpen,setBoardOpen]=useState(false);
  const lastOpened=useRef<number|null>(null);
  const feedScroll=useRef(0);
  const detailHeading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{
    const restore=()=>setSelected(selectedFromUrl());
    window.addEventListener('popstate',restore);
    return ()=>window.removeEventListener('popstate',restore);
  },[]);
  useEffect(()=>{
    setDraft(''); setNotice('');
    if(selected!==null) {
      window.scrollTo(0,0);
      detailHeading.current?.focus({preventScroll:true});
    } else if(lastOpened.current!==null) {
      window.scrollTo(0,feedScroll.current);
      document.getElementById('open-pin-'+lastOpened.current)?.focus({preventScroll:true});
    }
  },[selected]);
  const navigate=(index:number|null)=>{
    if(selected===null&&index!==null) { feedScroll.current=window.scrollY; lastOpened.current=index; }
    const url=new URL(location.href);
    if(index===null) url.searchParams.delete('pin'); else url.searchParams.set('pin',String(index));
    history.pushState({},'',url);
    setSelected(index);
  };
  const toggleSave=(index:number)=>setSaved(current=>current.includes(index)?current.filter(i=>i!==index):[...current,index]);
  const shown=pins.map((pin,index)=>({...pin,index})).filter(pin=>
    !hidden.includes(pin.index)&&(!onlySaved||saved.includes(pin.index))&&
    (pin.title+' '+pin.maker).toLowerCase().includes(query.toLowerCase()));

  const renderPin=(index:number)=>{
    const pin=pins[index];
    return <div className="pin-placement" key={index}>
      <Card className="pin" data-testid={'pin-'+index}>
        <CardMedia>
          <a id={'open-pin-'+index} className="pin-open" href={'?page=pinterest&pin='+index} aria-label={'Open '+pin.title}
            onClick={event=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(index);}}}>
            <Image size="full" src={pinArtwork(index)} alt={pin.title} aspectRatio={pin.ratio} objectFit="cover" objectPosition="50% 0%"/>
          </a>
        </CardMedia>
        <CardContent>
          <div className="pin-caption">
            <div className="pin-caption-copy"><Text truncate weight="semibold" title={pin.title}>{pin.title}</Text><Text className="muted small" truncate>{pin.maker}</Text></div>
            <Popover placement="bottom">
              <Popover.Trigger asChild><Button className="quiet icon-button" ariaLabel={'More options for '+pin.title}><Icon name="more-horizontal"/></Button></Popover.Trigger>
              <Popover.Content className="pin-menu"><Text weight="bold">This idea</Text><Button className="quiet" onClick={()=>{setHidden(items=>[...items,index]);}}>Hide this Pin</Button></Popover.Content>
            </Popover>
          </div>
        </CardContent>
      </Card>
      <div className="pin-action"><Button className="save-button" ariaLabel={(saved.includes(index)?'Unsave ':'Save ')+pin.title} ariaPressed={saved.includes(index)} onClick={()=>toggleSave(index)}>{saved.includes(index)?'Saved':'Save'}</Button></div>
    </div>;
  };
  const pin=selected===null?null:pins[selected];
  return <main className="retoken pinterest">
    <header className="pin-header">
      <Button className="quiet pin-brand" ariaLabel="Pinboard home" onClick={()=>{navigate(null);setOnlySaved(false);setQuery('');}}><Text className="pin-mark" weight="bold">p</Text><Text weight="bold">Pinboard</Text></Button>
      <Button ariaPressed={!onlySaved} className={!onlySaved?'selected':'quiet'} onClick={()=>{navigate(null);setOnlySaved(false);}}>Home</Button>
      <Button ariaPressed={onlySaved} className={onlySaved?'selected':'quiet'} onClick={()=>{navigate(null);setOnlySaved(true);}}>Saved ({saved.length})</Button>
      <Stack variant="horizontal" className="search-region"><Icon name="search"/><Input ariaLabel="Search collection" placeholder="Search for ideas" value={query} onChange={value=>{setQuery(value);if(selected!==null)navigate(null);}}/></Stack>
      <Button className="quiet icon-button switch-page" ariaLabel="Switch to music page" onClick={()=>{location.search='?page=spotify';}}><Icon name="panel-left"/></Button>
      <Avatar name="Your collection" initials="Y" size="lg" className="pin-profile"/>
    </header>
    {pin&&selected!==null ? <div className="pin-detail-layout">
      <Card className="pin-detail-card">
        <div className="pin-detail-panel">
          <div className="pin-detail-art">
            <Image size="full" src={pinArtwork(selected)} alt={pin.title}/>
            <div className="pin-back"><Button className="round-action" ariaLabel="Back to feed" onClick={()=>navigate(null)}><Icon name="arrow-left"/></Button></div>
          </div>
          <section className="pin-information" aria-label="Pin details">
            <div className="pin-toolbar">
              <Button className="quiet" ariaPressed={liked.includes(selected)} ariaLabel={'Like '+pin.title} onClick={()=>setLiked(items=>items.includes(selected)?items.filter(i=>i!==selected):[...items,selected])}>{liked.includes(selected)?'Liked':'Like'} {liked.includes(selected)?1:0}</Button>
              <Button className="quiet icon-button" ariaLabel="Copy Pin link" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setNotice('Pin link copied');}catch{setNotice('Copy this page address from your browser to share this Pin.');}}}><Icon name="external-link"/></Button>
              <div className="pin-board"><Popover open={boardOpen} onOpenChange={setBoardOpen} placement="bottom"><Popover.Trigger asChild><Button className="quiet" ariaLabel="Choose board">{board}<Icon name="chevron-down"/></Button></Popover.Trigger><Popover.Content className="pin-menu">{['Design inspiration','Read later','Studio references'].map(name=><Button key={name} className="quiet" ariaPressed={board===name} onClick={()=>{setBoards(current=>({...current,[selected]:name}));setBoardOpen(false);}}>{name}</Button>)}</Popover.Content></Popover></div>
              <Button className="save-button" ariaLabel={(saved.includes(selected)?'Unsave ':'Save ')+pin.title} ariaPressed={saved.includes(selected)} onClick={()=>toggleSave(selected)}>{saved.includes(selected)?'Saved':'Save'}</Button>
            </div>
            <Stack className="pin-author" variant="horizontal"><Avatar size="md" name={pin.maker} initials={pin.maker.split(' ').map(word=>word[0]).slice(0,2).join('')}/><Text>{pin.maker}</Text></Stack>
            <h1 ref={detailHeading} tabIndex={-1} className="pin-detail-heading"><Text as="span" weight="bold" className="section-title">{pin.title}</Text></h1>
            <Card className="pin-context"><CardContent><Text weight="semibold">From the studio</Text><Text className="muted">An original study in typography, composition and visual systems. Saved as a reference for your next project.</Text></CardContent></Card>
            <Text weight="bold">Description</Text><Text className="muted">A closer look at {pin.maker}'s approach to form, rhythm and hierarchy. Part of our independent design collection.</Text>
            {saved.includes(selected)&&<Text className="small">Saved to {board}</Text>}
            <div className="pin-comments">
              <Text weight="bold">Comments ({(comments[selected]??[]).length})</Text>
              {(comments[selected]??[]).length===0?<Text className="muted">What catches your eye?</Text>:(comments[selected]??[]).map((comment,index)=><Card className="pin-context" key={index}><CardContent><Text weight="semibold">You</Text><Text>{comment}</Text></CardContent></Card>)}
            </div>
            <form className="pin-comment-form" onSubmit={event=>{event.preventDefault();const value=draft.trim();if(!value)return;setComments(current=>({...current,[selected]:[...(current[selected]??[]),value]}));setDraft('');}}>
              <Input ariaLabel="Add a comment" placeholder="Add a comment to start the conversation" value={draft} onChange={setDraft}/>
              <Button className="quiet icon-button" ariaLabel="Post comment" type="submit" disabled={!draft.trim()}><Icon name="arrow-up"/></Button>
            </form>
            {notice&&<Text role="status" className="small">{notice}</Text>}
          </section>
        </div>
      </Card>
      <aside aria-label="Related Pins" className="related-pins"><Text as="h2" className="related-heading" weight="bold">More like this</Text><div className="pin-feed">{pins.map((_,index)=>index).filter(index=>index!==selected&&!hidden.includes(index)).map(renderPin)}</div></aside>
    </div> : <>
      <h1 className="feed-heading"><Text as="span" weight="semibold">{onlySaved?'Your saved ideas':query?'Search results':'For you'}</Text></h1>
      <div className="pin-feed">{shown.map(pin=>renderPin(pin.index))}</div>
      {shown.length===0&&<Text className="empty-state" role="status">No ideas found</Text>}
    </>}
  </main>;
}
