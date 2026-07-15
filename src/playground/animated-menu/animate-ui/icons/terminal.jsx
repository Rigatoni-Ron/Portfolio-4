import * as React from 'react'
import { motion } from 'motion/react'
import { getVariants, useAnimateIconContext, IconWrapper } from './icon'

const animations = {
  default: {
    path1: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0, 1, 0, 1],
        transition: { duration: 1.5, ease: 'easeInOut' },
      },
    },
    path2: {},
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
      <motion.path d="M12 19h8" variants={variants.path1} initial="initial" animate={controls} />
      <motion.path d="m4 17 6-6-6-6" variants={variants.path2} initial="initial" animate={controls} />
    </motion.svg>
  )
}

function Terminal(props) {
  return <IconWrapper icon={IconComponent} {...props} />
}

export { Terminal, Terminal as TerminalIcon }
