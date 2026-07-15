import * as React from 'react'
import { motion, useAnimation } from 'motion/react'

const AnimateIconContext = React.createContext(null)

function useAnimateIconContext() {
  const ctx = React.useContext(AnimateIconContext)
  if (!ctx) return {
    controls: undefined,
    animation: 'default',
    loop: false,
    loopDelay: 0,
    active: false,
    animate: undefined,
  }
  return ctx
}

function AnimateIcon({
  asChild = false,
  animate = false,
  animateOnHover = false,
  animation = 'default',
  loop = false,
  loopDelay = 0,
  children,
  ...props
}) {
  const controls = useAnimation()
  const [localAnimate, setLocalAnimate] = React.useState(!!animate)
  const [currentAnimation, setCurrentAnimation] = React.useState(
    typeof animate === 'string' ? animate : animation
  )

  const runRef = React.useRef(0)
  const activeRef = React.useRef(localAnimate)

  React.useEffect(() => { activeRef.current = localAnimate }, [localAnimate])

  React.useEffect(() => {
    if (animate === undefined) return
    setCurrentAnimation(typeof animate === 'string' ? animate : animation)
    setLocalAnimate(!!animate)
  }, [animate, animation])

  React.useEffect(() => {
    const gen = ++runRef.current

    async function run() {
      if (!localAnimate) {
        try { await controls.start('initial') } catch {}
        return
      }
      if (loop) {
        try { controls.set('initial') } catch {}
      }
      try { await controls.start('animate') } catch { return }
      if (gen !== runRef.current) return
      if (loop && activeRef.current) {
        if (loopDelay > 0) {
          await new Promise(r => setTimeout(r, loopDelay))
        }
        if (gen === runRef.current && activeRef.current) run()
      }
    }

    run()
    return () => { runRef.current++ }
  }, [localAnimate, controls, loop, loopDelay])

  function handleMouseEnter() {
    if (animateOnHover) setLocalAnimate(true)
  }
  function handleMouseLeave() {
    if (animateOnHover) setLocalAnimate(false)
  }

  let content
  if (asChild && React.isValidElement(children)) {
    content = React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    })
  } else {
    content = (
      <motion.span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </motion.span>
    )
  }

  return (
    <AnimateIconContext.Provider value={{
      controls,
      animation: currentAnimation,
      loop,
      loopDelay,
      active: localAnimate,
      animate,
    }}>
      {content}
    </AnimateIconContext.Provider>
  )
}

function IconWrapper({
  size = 28,
  animation: animationProp,
  animate,
  animateOnHover,
  loop,
  loopDelay,
  icon: IconComponent,
  ...props
}) {
  const context = React.useContext(AnimateIconContext)

  if (context) {
    const { controls, animation: parentAnimation, loop: parentLoop, loopDelay: parentLoopDelay, active: parentActive } = context
    const animationToUse = animationProp ?? parentAnimation

    return (
      <AnimateIconContext.Provider value={{
        controls,
        animation: animationToUse,
        loop: parentLoop,
        loopDelay: parentLoopDelay,
        active: parentActive,
      }}>
        <IconComponent size={size} {...props} />
      </AnimateIconContext.Provider>
    )
  }

  if (animate !== undefined || animateOnHover !== undefined || animationProp !== undefined) {
    return (
      <AnimateIcon
        animate={animate}
        animateOnHover={animateOnHover}
        animation={animationProp}
        loop={loop}
        loopDelay={loopDelay}
        asChild
      >
        <IconComponent size={size} {...props} />
      </AnimateIcon>
    )
  }

  return <IconComponent size={size} {...props} />
}

function getVariants(animations) {
  const { animation: animationType } = useAnimateIconContext()
  return animations[animationType] ?? animations.default
}

export { AnimateIcon, IconWrapper, useAnimateIconContext, getVariants }
