import * as React from 'react'
import { motion } from 'motion/react'
import { getVariants, useAnimateIconContext, IconWrapper } from './icon'

const animations = {
  default: {
    polygon: {
      initial: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  },
}

function IconComponent({ size, ...props }) {
  const { controls } = useAnimateIconContext()
  const variants = getVariants(animations)

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      {...props}
    >
      <motion.polygon
        points="6 3 20 12 6 21 6 3"
        variants={variants.polygon}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  )
}

function Play(props) {
  return <IconWrapper icon={IconComponent} {...props} />
}

export { Play, Play as PlayIcon }
