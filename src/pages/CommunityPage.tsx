import { Bookmark, Flag, Heart, MessageCircle, RefreshCw, Search, Send, Trash2, UserPlus } from 'lucide-react'
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
    <section className="page-grid">
      <header className="page-header">
        <div>
          <span className="eyebrow">Public, following, place feed</span>
          <h1>Community</h1>
        </div>
        <form
          className="search-row"
          onSubmit={(event) => {
            event.preventDefault()
            load()
          }}
        >
          <div className="segmented compact-tabs">
            <button className={feedMode === 'public' ? 'selected' : ''} onClick={() => setFeedMode('public')} type="button">
              Public
            </button>
            <button className={feedMode === 'following' ? 'selected' : ''} disabled={!user} onClick={() => setFeedMode('following')} type="button">
              Following
            </button>
            <button className={feedMode === 'place' ? 'selected' : ''} onClick={() => setFeedMode('place')} type="button">
              Place
            </button>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input aria-label="Tag" onChange={(event) => setTag(event.target.value)} placeholder="Tag" value={tag} />
          </div>
          <button className="icon-button" title="Refresh" type="submit">
            <RefreshCw size={18} />
          </button>
        </form>
      </header>
      {error && <p className="surface-error">{error}</p>}
      {user && (
        <form className="inline-form multi-row" onSubmit={createPost}>
          <input onChange={(event) => setPlaceId(event.target.value)} placeholder="Place ID" required value={placeId} />
          <select aria-label="Post type" onChange={(event) => setType(event.target.value as PostType)} value={type}>
            <option value="check_in">check_in</option>
            <option value="experience">experience</option>
            <option value="tip">tip</option>
          </select>
          <input onChange={(event) => setVisitDate(event.target.value)} type="datetime-local" value={visitDate} />
          <input onChange={(event) => setContent(event.target.value)} placeholder="Experience" required value={content} />
          <label className="file-input">
            <span>{files.length > 0 ? `${files.length} images` : 'Images'}</span>
            <input accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} type="file" />
          </label>
          <button className="primary-button compact" type="submit">
            <Send size={15} />
            Post
          </button>
        </form>
      )}
      <div className="split-layout social-layout">
        <div className="feed-grid">
          {posts.map((post) => (
            <article className="post-card" key={post._id}>
              <div className="post-head">
                <Avatar name={displayAuthor(post.author)} src={typeof post.author === 'string' ? undefined : post.author.avatarUrl} />
                <div>
                  <strong>{displayAuthor(post.author)}</strong>
                  <span>{displayPlace(post.place)}</span>
                </div>
              </div>
              <p>{post.content}</p>
              <ImageStrip images={post.images} name="Post" />
              <div className="toolbar">
                <button className="chip-button" disabled={!user} onClick={() => like(post)} type="button">
                  <Heart size={15} />
                  {post.likeCount}
                </button>
                <button className="chip-button" onClick={() => setSelected(post)} type="button">
                  <MessageCircle size={15} />
                  {post.commentCount}
                </button>
                <button className="chip-button" disabled={!user} onClick={() => save(post)} type="button">
                  <Bookmark size={15} />
                  {post.saveCount}
                </button>
                <button className="chip-button" disabled={!user} onClick={() => reportPost(post)} type="button">
                  <Flag size={15} />
                  {post.reportCount}
                </button>
                <button className="chip-button" disabled={!user || typeof post.author === 'string'} onClick={() => followAuthor(post)} type="button">
                  <UserPlus size={15} />
                </button>
                <button className="chip-button danger" disabled={!user} onClick={() => removePost(post)} type="button">
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="detail-column">
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
        </aside>
      </div>
    </section>
  )
}
