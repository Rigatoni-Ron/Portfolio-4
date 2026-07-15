import * as React from 'react'
import { motion } from 'motion/react'
import { getVariants, useAnimateIconContext, IconWrapper } from './icon'

const animations = {
  default: {
    lid: {
      initial: { y: 0 },
      animate: {
        y: [0, -3, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    body: {},
    line: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.6, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
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
      <motion.rect width={20} height={5} x={2} y={3} rx={1} variants={variants.lid} initial="initial" animate={controls} />
      <motion.path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" variants={variants.body} initial="initial" animate={controls} />
      <motion.path d="M10 12h4" variants={variants.line} initial="initial" animate={controls} />
    </motion.svg>
  )
}

function Archive(props) {
  return <IconWrapper icon={IconComponent} {...props} />
}

export { Archive, Archive as ArchiveIcon }
