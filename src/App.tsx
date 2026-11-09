import { Brand, Icon } from './Brand'
import Kiosk from './Kiosk'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { api, errorMessage, useSession, type FAQ, type Office, type User } from './api'

function Modal({ title, children, close, busy = false, variant = 'create', icon = 'chat' }: { title: string; children: ReactNode; close: () => void; busy?: boolean; variant?: 'create' | 'edit' | 'delete'; icon?: 'chat' | 'office' }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current!; const previous = document.activeElement as HTMLElement | null; dialog.showModal(); return () => { dialog.close(); previous?.focus() } }, [])
  return <dialog className={`design-dialog ${variant}`} ref={ref} aria-labelledby="dialog-title" onCancel={e => { e.preventDefault(); if (!busy) close() }}>
    <header className="modal-head"><h2 id="dialog-title">{variant !== 'delete' && <Icon name={icon}/>} {title}</h2><button type="button" className="icon" aria-label="Close dialog" disabled={busy} onClick={close}>×</button></header>{children}
  </dialog>
}
function Alert({ children, success = false }: { children: ReactNode; success?: boolean }) { return <div role={success ? 'status' : 'alert'} className={`alert ${success ? 'success' : ''}`}>{children}</div> }
function Login() {
  const { user, set } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)
  const [remember, setRemember] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const emailError = !email.trim() ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Enter a valid email address.' : ''
  const passwordError = !password.trim() ? 'Password is required.' : ''
  if (user) return <Navigate to="/faqs" replace />
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setTouched({ email: true, password: true })
    setError('')
    if (emailError || passwordError) {
      if (emailError) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }
    setBusy(true)
    try {
      const { data } = await api.post<{ user: User }>('/auth/sign-in/email', { email: email.trim(), password, rememberMe: remember })
      if (!data.user) throw new Error('Missing session')
      set(data.user)
    } catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }
  return <main className="login">
    <section className="login-story"><Brand/></section>
    <section className="login-form"><div className="login-inner">
      <h2>Login</h2>
      <form onSubmit={submit} noValidate>
        <label className="login-email-label" htmlFor="login-email"><span className="sr-only">Email address</span>
          <input id="login-email" ref={emailRef} name="email" type="email" autoComplete="username" placeholder="Email address" required disabled={busy}
            value={email} onChange={e => { setEmail(e.target.value); setError('') }} onBlur={() => setTouched(old => ({ ...old, email: true }))}
            aria-invalid={touched.email && !!emailError} aria-describedby={touched.email && emailError ? 'email-error' : undefined}/>
          {touched.email && emailError && <span id="email-error" className="field-error" aria-live="polite">{emailError}</span>}
        </label>
        <label className="sr-only" htmlFor="login-password">Password</label>
        <div className="password login-password"><input id="login-password" ref={passwordRef} name="password" placeholder="Password" type={visible ? 'text' : 'password'} autoComplete="current-password" required disabled={busy}
            value={password} onChange={e => { setPassword(e.target.value); setError('') }} onBlur={() => setTouched(old => ({ ...old, password: true }))}
            aria-invalid={touched.password && !!passwordError} aria-describedby={touched.password && passwordError ? 'password-error' : undefined}/>
          <button type="button" disabled={busy} onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>{visible ? 'Hide' : 'Show'}</button>
        </div>
        {touched.password && passwordError && <span id="password-error" className="field-error" aria-live="polite">{passwordError}</span>}
        {error && <Alert>{error}</Alert>}
        <label className="checkbox remember-me"><input type="checkbox" checked={remember} disabled={busy} onChange={e=>setRemember(e.target.checked)}/> Remember me</label>
        <button className="primary full login-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div></section>
  </main>
}
function Shell() {
  const {user, set} = useSession()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)
  if (!user) return <Navigate to="/login" replace />
  async function logout() { setBusy(true); try { await api.post('/auth/sign-out', {}); set(null) } catch (err) { setError(errorMessage(err)) } finally { setBusy(false) } }
  return <div className={`shell figma-shell ${expanded ? 'sidebar-expanded' : ''}`}>
    <aside id="staff-sidebar"
      onPointerEnter={e=>{if(e.pointerType==='mouse') setExpanded(true)}}
      onPointerLeave={e=>{if(e.pointerType==='mouse') setExpanded(false)}}
      onFocusCapture={e=>{if(e.target.matches(':focus-visible')) setExpanded(true)}}
      onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node | null)) setExpanded(false)}}
      onKeyDown={e=>{if(e.key==='Escape'){setExpanded(false);e.stopPropagation()}}}>
      <button className="sidebar-brand" aria-label="Admin navigation" aria-expanded={expanded} aria-controls="staff-navigation"
        onClick={e=>{if(e.detail===0 || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) setExpanded(value=>!value)}}><Brand/><span className="sidebar-label"><strong>ADMIN</strong><small>Panel</small></span></button>
    <nav id="staff-navigation" aria-label="Staff navigation"><NavLink to="/faqs" aria-label="FAQs" title="FAQs"><Icon name="chat"/><span className="sidebar-label">FAQs</span></NavLink><NavLink to="/offices" aria-label="Office" title="Office"><Icon name="office"/><span className="sidebar-label">Office</span></NavLink><NavLink to="/test" aria-label="Kiosk testing" title="Kiosk testing"><Icon name="kiosk"/><span className="sidebar-label">Kiosk testing</span></NavLink></nav>
    <div className="sidebar-bottom"><div className="avatar">{(user.name || user.email).slice(0,1).toUpperCase()}</div><div className="sidebar-label"><strong>{user.name || 'Staff'}</strong><small title={user.email}>Staff</small></div><button onClick={logout} disabled={busy} aria-label="Sign out" title="Sign out"><Icon name="logout"/></button></div></aside>
    <div className="workspace"><main className="content">{error && <Alert>{error}</Alert>}<Routes><Route path="/faqs" element={<Management kind="faqs" key="faqs"/>}/><Route path="/offices" element={<Management kind="offices" key="offices"/>}/><Route path="/test" element={<TestPage/>}/><Route path="*" element={<Navigate to="/faqs" replace/>}/></Routes></main></div>
  </div>
}

type RecordItem = FAQ | Office
const isFaq = (item: RecordItem): item is FAQ => 'question' in item
function Management({kind}: {kind: 'faqs' | 'offices'}) {
  const faqMode = kind === 'faqs'; const [rows, setRows] = useState<RecordItem[]>([]); const [offices, setOffices] = useState<Office[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [search, setSearch] = useState(''); const [status, setStatus] = useState('all'); const [categories, setCategories] = useState<string[]>([]); const [officeFilters, setOfficeFilters] = useState<number[]>([]); const [buildings, setBuildings] = useState<string[]>([]); const [edit, setEdit] = useState<RecordItem | 'new' | null>(null); const [remove, setRemove] = useState<RecordItem | null>(null); const [busy, setBusy] = useState(false); const [dialogError, setDialogError] = useState('')
  async function load() { setLoading(true); setError(''); try { if (faqMode) { const [f,o] = await Promise.all([api.get<{faqs: FAQ[]}>('/admin/faqs'), api.get<{offices: Office[]}>('/admin/offices')]); setRows(f.data.faqs); setOffices(o.data.offices) } else { const {data} = await api.get<{offices: Office[]}>('/admin/offices'); setRows(data.offices) } } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [kind])
  const filtered = rows.filter(row => {
    const text = isFaq(row) ? `${row.question} ${row.answer} ${row.category}` : `${row.name} ${row.room} ${row.building} ${row.contact || ''}`
    if (!text.toLowerCase().includes(search.trim().toLowerCase())) return false
    return isFaq(row) ? (status === 'all' || row.status === (status === 'published')) && (!categories.length || categories.includes(row.category)) && (!officeFilters.length || (row.officeId !== null && officeFilters.includes(row.officeId))) : !buildings.length || buildings.includes(row.building)
  })
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget); const val = (key: string) => String(form.get(key) || '').trim()
    const payload = faqMode ? { question: val('question'), answer: val('answer'), category: val('category'), officeId: val('officeId') ? Number(val('officeId')) : null, status: form.get('status') === 'on' } : { name: val('name'), room: val('room'), building: val('building'), hours: val('hours'), contact: val('contact') || null }
    if (Object.entries(payload).some(([key,value]) => !['officeId','status','contact'].includes(key) && typeof value === 'string' && !value)) { setDialogError('Please fill in all required fields.'); return }
    setBusy(true); setDialogError(''); try { const response = edit === 'new' ? await api.post(`/admin/${kind}`,payload) : await api.patch(`/admin/${kind}/${(edit as RecordItem).id}`,payload); const record: RecordItem = faqMode ? response.data.faq : response.data.office; setRows(old => edit === 'new' ? [...old,record] : old.map(r => r.id === record.id ? record : r)); setEdit(null); setNotice(`${faqMode ? 'FAQ' : 'Office'} saved.`) } catch (err) { setDialogError(errorMessage(err)) } finally { setBusy(false) }
  }
  async function toggle(row: FAQ) { setBusy(true); setError(''); setNotice(''); try { const {data} = await api.patch<{faq: FAQ}>(`/admin/faqs/${row.id}`,{status: !row.status}); setRows(old => old.map(r => r.id === row.id ? data.faq : r)); setNotice(data.faq.status ? 'FAQ published.' : 'FAQ unpublished.') } catch(err) { setError(errorMessage(err)) } finally { setBusy(false) } }
  async function deleteRecord() { if (!remove) return; setBusy(true); setDialogError(''); try { await api.delete(`/admin/${kind}/${remove.id}`); setRows(old => old.filter(r => r.id !== remove.id)); setRemove(null); setNotice(`${faqMode ? 'FAQ' : 'Office'} deleted.`) } catch(err) { setDialogError(errorMessage(err) + (!faqMode ? ' If FAQs use this office, reassign those links before deleting it.' : '')) } finally { setBusy(false) } }
  const item = edit && edit !== 'new' ? edit : null
  return <div className={faqMode ? 'faq-page' : 'office-page'}>
    {faqMode ? <header className="faq-heading"><h1>Frequently Asked<strong>Questions</strong></h1></header> : <header className="office-heading"><h1>Office</h1><p>Manage office information across the university</p></header>}
    {notice && <Alert success>{notice}</Alert>}{error && <Alert>{error} <button onClick={() => void load()} disabled={loading}>Refresh</button></Alert>}
    <section className={`management-body ${faqMode ? '' : 'office-panel'}`}>
      <div className="design-toolbar">
        {!faqMode && <h2>Total Office: {rows.length}</h2>}
        <label className="design-search"><Icon name="search"/><span className="sr-only">Search {kind}</span><input placeholder={faqMode ? 'Search question' : 'Search office name, room, contact'} value={search} onChange={e=>setSearch(e.target.value)}/></label>
        <details className="filter-menu"><summary aria-label="Filter records" title="Filter records"><Icon name="filter"/></summary><div className="filter-popover">
          {faqMode ? <><fieldset><legend>Category</legend>{[...new Set(rows.filter(isFaq).map(r=>r.category))].map(c=><label key={c}><input type="checkbox" checked={categories.includes(c)} onChange={()=>setCategories(old=>old.includes(c)?old.filter(v=>v!==c):[...old,c])}/>{c}</label>)}</fieldset><fieldset><legend>Office</legend>{offices.map(o=><label key={o.id}><input type="checkbox" checked={officeFilters.includes(o.id)} onChange={()=>setOfficeFilters(old=>old.includes(o.id)?old.filter(v=>v!==o.id):[...old,o.id])}/>{o.name}</label>)}</fieldset><label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="unpublished">Unpublished</option></select></label></> : <fieldset><legend>Building</legend>{[...new Set(rows.filter((r): r is Office=>!isFaq(r)).map(r=>r.building))].map(b=><label key={b}><input type="checkbox" checked={buildings.includes(b)} onChange={()=>setBuildings(old=>old.includes(b)?old.filter(v=>v!==b):[...old,b])}/>{b}</label>)}</fieldset>}
          <button type="button" onClick={()=>{setCategories([]);setOfficeFilters([]);setBuildings([]);setStatus('all')}}>Clear filters</button>
        </div></details>
        <button className="primary add-button" disabled={loading || !!error} onClick={()=>{setEdit('new');setDialogError('')}}>+ Add {faqMode ? 'FAQ' : 'Office'}</button>
      </div>
      {loading ? <div className="empty" role="status">Loading {kind}…</div> : error ? <div className="empty">Records could not be loaded.</div> : !filtered.length ? <div className="empty"><h2>{rows.length ? 'No matching results' : `No ${faqMode ? 'FAQs' : 'offices'} yet`}</h2><p>{rows.length ? 'Try another search or clear the filters.' : 'Add your first record to get started.'}</p></div> : faqMode ? <div className="faq-cards">
        {filtered.filter(isFaq).map(row=><details className="faq-card" key={row.id}><summary><span>{row.question}</span><span className="faq-chevron" aria-hidden="true"/></summary><div className="faq-expanded"><p className="faq-answer">{row.answer}</p><div className="faq-record-meta"><span>{row.category}</span><span>{offices.find(o=>o.id===row.officeId)?.name || 'No office'}</span><span className={`badge ${row.status ? 'published' : ''}`}>{row.status ? 'Published' : 'Unpublished'}</span><time dateTime={row.updatedAt}>Updated {new Date(row.updatedAt).toLocaleString()}</time></div><div className="faq-record-actions"><button className="publish-action" disabled={busy} onClick={()=>void toggle(row)}>{row.status ? 'Unpublish' : 'Publish'}</button><button className="edit-action" aria-label={`Edit FAQ: ${row.question}`} title="Edit FAQ" disabled={busy} onClick={()=>{setEdit(row);setDialogError('')}}><Icon name="edit"/></button><button className="delete-action" aria-label={`Delete FAQ: ${row.question}`} title="Delete FAQ" disabled={busy} onClick={()=>{setRemove(row);setDialogError('')}}><Icon name="delete"/></button></div></div></details>)}
      </div> : <div className="table-scroll"><table className="office-table"><thead><tr>{['Name','Room','Building','Hours','Contact','Action'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.filter((r):r is Office=>!isFaq(r)).map(row=><tr key={row.id}><td>{row.name}</td><td>{row.room}</td><td>{row.building}</td><td>{row.hours}</td><td>{row.contact || '—'}</td><td><div className="office-actions"><button className="edit-action" aria-label={`Edit office: ${row.name}`} title="Edit office" disabled={busy} onClick={()=>{setEdit(row);setDialogError('')}}><Icon name="edit"/></button><button className="delete-action" aria-label={`Delete office: ${row.name}`} title="Delete office" disabled={busy} onClick={()=>{setRemove(row);setDialogError('')}}><Icon name="delete"/></button></div></td></tr>)}</tbody></table></div>}
      <footer className="design-list-footer"><span>{loading ? 'Loading records' : `${filtered.length} ${faqMode ? 'FAQs' : 'offices'} shown`}</span><button onClick={()=>void load()} disabled={loading}>Refresh</button></footer>
    </section>
    {edit && <Modal title={faqMode ? (edit==='new'?'New FAQ':'Edit FAQ') : (edit==='new'?'New Office':'Edit Office Information')} variant={edit==='new'?'create':'edit'} icon={faqMode?'chat':'office'} close={()=>setEdit(null)} busy={busy}><form onSubmit={save}><fieldset disabled={busy}>
      {faqMode ? <><div className="form-grid"><label>Category *<input name="category" list="faq-categories" required maxLength={100} placeholder="Category name" defaultValue={item && isFaq(item)?item.category:''}/><datalist id="faq-categories">{[...new Set(rows.filter(isFaq).map(r=>r.category))].map(c=><option key={c} value={c}/>)}</datalist></label><label>Office<select name="officeId" defaultValue={item && isFaq(item)?item.officeId??'':''}><option value="">No office</option>{offices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label></div><label>Question *<input name="question" required maxLength={255} placeholder="Enter a question" defaultValue={item && isFaq(item)?item.question:''}/></label><label>Answer *<textarea name="answer" required rows={3} placeholder="Enter the approved answer" defaultValue={item && isFaq(item)?item.answer:''}/></label><label className="checkbox"><input type="checkbox" name="status" defaultChecked={!!(item && isFaq(item) && item.status)}/> Published</label><p className="caption">Unchecked FAQs stay unpublished and do not appear on the student kiosk.</p></> : <><label>Office Name *<input name="name" required maxLength={255} placeholder="Office name" defaultValue={item && !isFaq(item)?item.name:''}/></label><div className="form-grid office-form-grid"><label>Room *<input name="room" required maxLength={100} placeholder="Room 123" defaultValue={item && !isFaq(item)?item.room:''}/></label><label>Building *<input name="building" required maxLength={100} placeholder="Building name" defaultValue={item && !isFaq(item)?item.building:''}/></label><label>Hours *<input name="hours" required maxLength={255} placeholder="8:00 AM – 5:00 PM" defaultValue={item && !isFaq(item)?item.hours:''}/></label></div><label>Contact (optional)<input name="contact" maxLength={255} placeholder="Phone or email" defaultValue={item && !isFaq(item)?item.contact??'':''}/></label></>}
    </fieldset>{dialogError && <Alert>{dialogError}</Alert>}<footer className="modal-footer"><button type="button" disabled={busy} onClick={()=>setEdit(null)}>Cancel</button><button className="primary" disabled={busy}>{busy?'Saving…':edit==='new'?(faqMode?'Save FAQ':'Add Office'):'Submit'}</button></footer></form></Modal>}
    {remove && <Modal title={`Delete ${faqMode?'FAQ':'office'}`} variant="delete" close={()=>setRemove(null)} busy={busy}><div className="delete-symbol" aria-hidden="true">!</div><p className="delete-prompt">Are you sure you want to delete this {faqMode?'FAQ':'office'}<br/><strong>“{isFaq(remove)?remove.question:remove.name}”?</strong></p><p className="caption">This action cannot be undone.</p>{!faqMode && <p className="caption">Reassign any linked FAQs before deleting this office.</p>}{dialogError && <Alert>{dialogError}</Alert>}<footer className="modal-footer"><button disabled={busy} onClick={()=>setRemove(null)}>Cancel</button><button className="destructive" disabled={busy} onClick={()=>void deleteRecord()}>{busy?'Deleting…':'Delete'}</button></footer></Modal>}
  </div>
}

function TestPage() { return <><p className="eyebrow">INTEGRATION WORKSPACE</p><h1>Kiosk testing</h1><p className="muted">Preview the student experience with your published database content.</p><section className="test-panel"><span className="badge">Live backend content</span><h2>Try the student kiosk.</h2><p>Create an FAQ and publish it, then open the kiosk and refresh its questions. Answers and office details come from the backend.</p><p><a className="primary" style={{display:'inline-block',padding:'12px 20px',borderRadius:7}} href="/kiosk" target="_blank" rel="noreferrer">Open kiosk simulator ↗</a></p><p className="caption">Live suggestions support partial words and typos. No AI matching or microphone input. Browser audio is optional.</p></section></> }
function StaffApp() {
  const { ready, set } = useSession(); const [error,setError] = useState(''); const [retry,setRetry] = useState(0); const navigate = useNavigate()
  useEffect(()=> { let active=true; api.get<{user: User} | null>('/auth/get-session').then(({data})=>{if(active) set(data?.user ?? null)}).catch(err=>{if(active) setError(errorMessage(err))}); return ()=>{active=false} },[retry,set])
  if (!ready) return <main className="boot"><div className="brand">AskNEU</div>{error ? <><Alert>{error}</Alert><button onClick={()=>{setError('');setRetry(r=>r+1)}}>Retry connection</button><button onClick={()=>{set(null);navigate('/login')}}>Go to sign in</button></> : <p role="status">Checking your session…</p>}</main>
  return <Routes><Route path="/login" element={<Login/>}/><Route path="*" element={<Shell/>}/></Routes>
}

export default function App() { return <Routes><Route path="/kiosk" element={<Kiosk/>}/><Route path="*" element={<StaffApp/>}/></Routes> }
