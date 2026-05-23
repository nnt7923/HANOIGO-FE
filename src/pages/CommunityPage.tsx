import { Bookmark, Camera, Flag, Heart, Info, MapPin, MessageCircle, RefreshCw, Search, Send, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Avatar } from '../components/ui/Avatar'
import { ImageStrip } from '../components/ui/ImageStrip'
import { useAuth } from '../features/auth/hooks/useAuth'
import { displayAuthor, displayPlace, splitCsv } from '../lib/display'
import { api, getErrorMessage } from '../services/hanoigo.api'
import type { PostType, SocialComment, SocialPost } from '../types/api.type'

export function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [selected, setSelected] = useState<SocialPost | null>(null)
  const [comments, setComments] = useState<SocialComment[]>([])
  const [content, setContent] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [type, setType] = useState<PostType>('experience')
  const [tag, setTag] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState('')
  const [feedMode, setFeedMode] = useState<'public' | 'following' | 'place'>('public')
  const [error, setError] = useState('')

  async function load() {
    setError('')
    try {
      if (feedMode === 'following') {
        setPosts(await api.social.followingFeed({ limit: 20 }))
        return
      }
      if (feedMode === 'place' && placeId) {
        setPosts(await api.social.placePosts(placeId, { limit: 20 }))
        return
      }
      setPosts(await api.social.feed({ limit: 20, tag: tag || undefined, placeId: placeId || undefined }))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedMode])

  useEffect(() => {
    if (!selected) return
    api.social.comments(selected._id).then(setComments).catch((err) => setError(getErrorMessage(err)))
  }, [selected])

  async function createPost(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      const uploaded = files.length > 0 ? await api.uploads.images(files) : []
      const post = await api.social.createPost({
        placeId,
        content,
        type,
        images: uploaded.map((asset) => asset.secureUrl),
        tags: splitCsv(tag),
        visitDate: visitDate || undefined,
      })
      setPosts((items) => [post, ...items])
      setContent('')
      setFiles([])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function like(post: SocialPost) {
    try {
      await api.social.like(post._id)
      patchPost(post._id, { likeCount: post.likeCount + 1 })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function save(post: SocialPost) {
    try {
      await api.social.save(post._id)
      patchPost(post._id, { saveCount: post.saveCount + 1 })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    try {
      const next = await api.social.createComment(selected._id, { content: comment })
      setComments((items) => [...items, next])
      patchPost(selected._id, { commentCount: selected.commentCount + 1 })
      setComment('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function reportPost(post: SocialPost) {
    try {
      await api.social.reportPost(post._id, 'Spam or inappropriate content')
      patchPost(post._id, { reportCount: post.reportCount + 1 })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function removePost(post: SocialPost) {
    try {
      await api.social.deletePost(post._id)
      setPosts((items) => items.filter((item) => item._id !== post._id))
      if (selected?._id === post._id) setSelected(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function followAuthor(post: SocialPost) {
    if (typeof post.author === 'string') return
    try {
      await api.social.follow(post.author._id)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function patchPost(id: string, patch: Partial<SocialPost>) {
    setPosts((items) => items.map((item) => (item._id === id ? { ...item, ...patch } : item)))
    setSelected((current) => (current?._id === id ? { ...current, ...patch } : current))
  }

  return (
    <section className="page-grid community-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Traveler group</span>
          <h1>HanoiGo Community</h1>
          <p>Share trip notes, ask for local tips, and follow stories tied to real places around Hanoi.</p>
        </div>
        <button className="ghost-button" onClick={load} type="button">
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>
      {error && <p className="surface-error">{error}</p>}

      <div className="community-layout">
        <aside className="community-sidebar">
          <section className="group-card">
            <div className="group-cover">
              <Users size={28} />
            </div>
            <h2>HanoiGo Travel Group</h2>
            <p>Public community for local discoveries, routes, check-ins, and practical travel tips.</p>
            <div className="community-stats">
              <span>{posts.length} posts</span>
              <span>{feedMode} feed</span>
            </div>
          </section>

          <form
            className="group-filter-card"
            onSubmit={(event) => {
              event.preventDefault()
              load()
            }}
          >
            <strong>Feeds</strong>
            <div className="group-feed-tabs">
              <button className={feedMode === 'public' ? 'selected' : ''} onClick={() => setFeedMode('public')} type="button">
                <Users size={16} />
                Public
              </button>
              <button className={feedMode === 'following' ? 'selected' : ''} disabled={!user} onClick={() => setFeedMode('following')} type="button">
                <Heart size={16} />
                Following
              </button>
              <button className={feedMode === 'place' ? 'selected' : ''} onClick={() => setFeedMode('place')} type="button">
                <MapPin size={16} />
                Place
              </button>
            </div>
            <label className="field">
              <span>Topic tag</span>
              <div className="search-box">
                <Search size={18} />
                <input aria-label="Tag" onChange={(event) => setTag(event.target.value)} placeholder="food, cafe, stay" value={tag} />
              </div>
            </label>
            <label className="field">
              <span>Place ID</span>
              <input onChange={(event) => setPlaceId(event.target.value)} placeholder="Required for place feed and posting" value={placeId} />
            </label>
            <button className="primary-button compact" type="submit">
              <RefreshCw size={15} />
              Apply filters
            </button>
          </form>
        </aside>

        <main className="community-feed">
          {user ? (
            <form className="group-composer" onSubmit={createPost}>
              <div className="post-head">
                <Avatar name={user.name} src={user.avatarUrl} />
                <input onChange={(event) => setContent(event.target.value)} placeholder={`Share a tip with the group, ${user.name}`} required value={content} />
              </div>
              <div className="composer-fields">
                <input onChange={(event) => setPlaceId(event.target.value)} placeholder="Place ID" required value={placeId} />
                <select aria-label="Post type" onChange={(event) => setType(event.target.value as PostType)} value={type}>
                  <option value="check_in">check_in</option>
                  <option value="experience">experience</option>
                  <option value="tip">tip</option>
                </select>
                <input onChange={(event) => setVisitDate(event.target.value)} type="datetime-local" value={visitDate} />
                <label className="file-input">
                  <Camera size={15} />
                  <span>{files.length > 0 ? `${files.length} images` : 'Images'}</span>
                  <input accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} type="file" />
                </label>
              </div>
              <div className="composer-actions">
                <input onChange={(event) => setTag(event.target.value)} placeholder="Tags CSV" value={tag} />
                <button className="primary-button compact" type="submit">
                  <Send size={15} />
                  Post to group
                </button>
              </div>
            </form>
          ) : (
            <div className="group-composer locked">
              <strong>Login to post, like, save, and follow travelers.</strong>
              <span>Guests can still browse public community stories.</span>
            </div>
          )}

          <div className="group-feed-list">
            {posts.map((post) => (
              <article className={selected?._id === post._id ? 'post-card group-post selected' : 'post-card group-post'} key={post._id}>
                <div className="post-head">
                  <Avatar name={displayAuthor(post.author)} src={typeof post.author === 'string' ? undefined : post.author.avatarUrl} />
                  <div>
                    <strong>{displayAuthor(post.author)}</strong>
                    <span>
                      <MapPin size={13} />
                      {displayPlace(post.place)}
                    </span>
                  </div>
                  <span className="pill compact">{post.type}</span>
                </div>
                <p>{post.content}</p>
                <ImageStrip images={post.images} name="Post" />
                <div className="post-reaction-row">
                  <span>{post.likeCount} likes</span>
                  <span>{post.commentCount} comments</span>
                  <span>{post.saveCount} saves</span>
                </div>
                <div className="toolbar group-actions">
                  <button className="chip-button" disabled={!user} onClick={() => like(post)} type="button">
                    <Heart size={15} />
                    Like
                  </button>
                  <button className="chip-button" onClick={() => setSelected(post)} type="button">
                    <MessageCircle size={15} />
                    Comment
                  </button>
                  <button className="chip-button" disabled={!user} onClick={() => save(post)} type="button">
                    <Bookmark size={15} />
                    Save
                  </button>
                  <button className="chip-button" disabled={!user || typeof post.author === 'string'} onClick={() => followAuthor(post)} type="button">
                    <UserPlus size={15} />
                    Follow
                  </button>
                  <button className="chip-button" disabled={!user} onClick={() => reportPost(post)} type="button">
                    <Flag size={15} />
                    Report
                  </button>
                  <button className="chip-button danger" disabled={!user} onClick={() => removePost(post)} type="button">
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="community-rightbar">
          <section className="group-card">
            <div className="panel-title inline">
              <strong>About this group</strong>
              <Info size={17} />
            </div>
            <p>Use place-linked posts so travelers can verify tips, routes, and recommendations.</p>
            <div className="community-rule">
              <ShieldCheck size={16} />
              Keep posts useful, local, and respectful.
            </div>
          </section>

          <section className="detail-column selected-post-panel">
          {selected ? (
            <>
              <article className="compact-item">
                <strong>{displayAuthor(selected.author)}</strong>
                <span>{displayPlace(selected.place)}</span>
                <p>{selected.content}</p>
              </article>
              {user && (
                <form className="inline-form" onSubmit={submitComment}>
                  <input onChange={(event) => setComment(event.target.value)} placeholder="Comment" required value={comment} />
                  <button className="primary-button compact" type="submit">
                    <Send size={15} />
                    Send
                  </button>
                </form>
              )}
              <div className="item-list">
                {comments.map((item) => (
                  <article className="compact-item" key={item._id}>
                    <strong>{displayAuthor(item.author)}</strong>
                    <p>{item.content}</p>
                    <span>{item.status}</span>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <MessageCircle size={28} />
              <span>Select a post</span>
            </div>
          )}
          </section>
        </aside>
      </div>
    </section>
  )
}
