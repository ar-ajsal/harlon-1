/**
 * CategoryStories — Instagram-style horizontal story circles
 * Shows categories as circular avatar-style cards with image + name
 * Click → navigates to /shop?category=X
 */
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CategoryStories({ categories, products }) {
    const scrollRef = useRef(null)
    const navigate = useNavigate()

    if (!categories?.length) return null

    const stories = [
        { id: 'all', name: 'All', emoji: '⚽', image: null },
        ...categories.map(cat => {
            const img = cat.image
                || products?.find(p => p.category === cat.name && p.images?.[0])?.images?.[0]
                || null
            return { id: encodeURIComponent(cat.name.toLowerCase()), name: cat.name, image: img, emoji: null }
        })
    ]

    const handleClick = (story) => {
        if (story.id === 'all') {
            navigate('/shop')
        } else {
            navigate(`/shop?category=${story.id}`)
        }
    }

    return (
        <section className="cat-stories-wrap" aria-label="Browse by category">
            <div className="cat-stories-scroll" ref={scrollRef}>
                {stories.map((story, i) => (
                    <motion.button
                        key={story.id}
                        className="cat-story-item"
                        onClick={() => handleClick(story)}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        aria-label={`Browse ${story.name}`}
                    >
                        <div className="cat-story-ring">
                            <div className="cat-story-circle">
                                {story.image ? (
                                    <img
                                        src={story.image}
                                        alt={story.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="cat-story-emoji">{story.emoji || '👕'}</span>
                                )}
                            </div>
                        </div>
                        <span className="cat-story-name">{story.name}</span>
                    </motion.button>
                ))}
            </div>
        </section>
    )
}
