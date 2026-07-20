
      import React, { useState, useRef, useEffect, useLayoutEffect } from "react"
import "./cs.css"
import mapleIcon from "./icons/maple.svg"
import sparkIcon from "./icons/spark.svg"
import coinbaseIcon from "./icons/coinbase.svg"
import chainlinkIcon from "./icons/chainlink.svg"
import morphoIcon from "./icons/morpho.svg"
import aaveIcon from "./icons/aave.svg"

      const h = React.createElement;

      const CARDS = [
        {
          title: "Maple Finance",
          subtitle: "Institutional Credit",
          url: "https://maple.finance",
          ticker: "MP",
          icon: mapleIcon,
          shaderVariant: 0,
          accent: "rgb(232, 134, 64)",
          collateral: "blue chip, stables, RWAs, T-Bills",
          stats: [
            { label: "Min Loan", value: "$1", unit: "M" },
            { label: "Max LTV", value: "70", unit: "%" },
            { label: "Time to Fund", value: "5", unit: "days" },
          ],
        },
        {
          title: "Spark Protocol",
          subtitle: "Permissionless Lending",
          url: "https://spark.fi",
          ticker: "SP",
          icon: sparkIcon,
          shaderVariant: 1,
          accent: "rgb(243, 120, 160)",
          collateral: "blue chip, LSTs, stables, RWAs",
          stats: [
            { label: "Min Loan", value: "$10", unit: "K" },
            { label: "Max LTV", value: "86", unit: "%" },
            { label: "Time to Fund", value: "Instant", unit: "" },
          ],
        },
        {
          title: "Coinbase Prime",
          subtitle: "Institutional Prime",
          url: "https://prime.coinbase.com",
          ticker: "CB",
          icon: coinbaseIcon,
          shaderVariant: 2,
          accent: "rgb(54, 110, 244)",
          collateral: "blue chip, stables",
          stats: [
            { label: "Min Loan", value: "$500", unit: "K" },
            { label: "Max LTV", value: "60", unit: "%" },
            { label: "Time to Fund", value: "3", unit: "days" },
          ],
        },
        {
          title: "Chainlink",
          subtitle: "Cross-Chain Liquidity",
          url: "https://chain.link",
          ticker: "CL",
          icon: chainlinkIcon,
          shaderVariant: 3,
          accent: "rgb(46, 95, 224)",
          collateral: "blue chip, wrapped assets, stables, RWAs, LSTs, tokenized treasuries",
          stats: [
            { label: "Min Loan", value: "$250", unit: "K" },
            { label: "Max LTV", value: "75", unit: "%" },
            { label: "Time to Fund", value: "3", unit: "days" },
          ],
        },
        {
          title: "Morpho",
          subtitle: "Modular Lending",
          url: "https://morpho.org",
          ticker: "MO",
          icon: morphoIcon,
          shaderVariant: 4,
          accent: "rgb(56, 130, 248)",
          collateral: "blue chip, wrapped assets, LSTs, stables, RWAs, LRTs, yield-bearing stables",
          stats: [
            { label: "Min Loan", value: "$25", unit: "K" },
            { label: "Max LTV", value: "86", unit: "%" },
            { label: "Time to Fund", value: "Instant", unit: "" },
          ],
        },
        {
          title: "Aave",
          subtitle: "Multi-Chain Money Market",
          url: "https://aave.com",
          ticker: "AV",
          icon: aaveIcon,
          shaderVariant: 5,
          accent: "rgb(177, 100, 213)",
          collateral: "blue chip, wrapped assets, LSTs, stables, alt coins, LRTs, RWAs",
          stats: [
            { label: "Min Loan", value: "$5", unit: "K" },
            { label: "Max LTV", value: "82.5", unit: "%" },
            { label: "Time to Fund", value: "Instant", unit: "" },
          ],
        },
      ];

      const N = CARDS.length;
      const CARD_H = 102;        // 78px image + 12px*2 padding
      const STACK_GAP = 12;      // vertical gap between cards in the lineup
      const ROW_PITCH = CARD_H + STACK_GAP;

      // Y-position of the top card; the selected card snaps here.
      const TOP_TY = (0 - (N - 1) / 2) * ROW_PITCH;

      // ─── Shader ──────────────────────────────────────────────
      // Single fullscreen quad + one fragment shader containing six
      // distinct line-field effects keyed off the uVariant uniform.
      // Each lender's accent color drives the gradient and the shader
      // produces stripe-like warped lines on top.
      const SHADER_VS = `attribute vec2 a; void main(){gl_Position=vec4(a,0.0,1.0);}`;

      const SHADER_FS = `
        precision mediump float;
        uniform float uTime;
        uniform vec2 uRes;
        uniform vec3 uAccent;
        uniform int uVariant;

        // 0 — Maple: horizontal stripe-like ribbons warped by stacked sines.
        vec3 m0(vec2 uv) {
          float t = uTime * 0.18;
          float warp = sin(uv.x * 3.0 + t) * 0.18
                     + sin(uv.x * 7.0 - t * 0.8) * 0.08
                     + sin(uv.x * 13.0 + uv.y * 2.0 + t * 0.4) * 0.04;
          float y = (uv.y + warp) * 70.0;
          float d = abs(fract(y) - 0.5) * 2.0;
          float intensity = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
          intensity *= 1.0 - uv.y * 0.55;
          vec3 grad = uAccent;
          return mix(uAccent * 0.06, grad, intensity);
        }

        // 1 — Spark: concentric radial lines warped by a low-freq sine.
        vec3 m1(vec2 uv) {
          vec2 p = uv - 0.5;
          float r = length(p);
          float a = atan(p.y, p.x);
          float t = uTime * 0.4;
          float warp = sin(a * 4.0 + t) * 0.04;
          float radial = (r + warp) * 70.0;
          float d = abs(fract(radial) - 0.5) * 2.0;
          float intensity = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
          intensity *= 1.0 - uv.y * 0.55;
          vec3 grad = mix(uAccent * 1.15, uAccent * vec3(1.0, 1.1, 0.8), r * 1.8);
          return mix(uAccent * 0.06, grad, clamp(intensity, 0.0, 1.0));
        }

        // 2 — Coinbase: subtle sweeping horizontal bands, calm and institutional.
        vec3 m2(vec2 uv) {
          float t = uTime * 0.1;
          float warp = sin(uv.x * 1.6 + t) * 0.13
                     + sin(uv.x * 3.5 - t * 0.6) * 0.06;
          float y = (uv.y + warp) * 70.0;
          float d = abs(fract(y) - 0.5) * 2.0;
          float intensity = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
          intensity *= 1.0 - uv.y * 0.55;
          vec3 grad = mix(uAccent * 0.9, uAccent * 1.15, uv.x);
          return mix(uAccent * 0.06, grad, intensity);
        }

        // 3 — Kamino: vertical aurora-style streaks drifting horizontally.
        vec3 m3(vec2 uv) {
          float t = uTime * 0.13;
          float warp = sin(uv.y * 2.0 + t) * 0.15
                     + sin(uv.y * 5.0 - t * 0.7) * 0.07;
          float x = (uv.x + warp) * 70.0;
          float d = abs(fract(x) - 0.5) * 2.0;
          float intensity = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
          intensity *= 1.0 - uv.y * 0.55;
          vec3 grad = mix(uAccent * 1.2, uAccent * 0.8, uv.y);
          return mix(uAccent * 0.05, grad, intensity);
        }

        // 4 — Morpho: crossed horizontal + vertical line bands (modular grid).
        vec3 m4(vec2 uv) {
          float t = uTime * 0.22;
          float warpA = sin(uv.x * 2.5 + t) * 0.1;
          float warpB = sin(uv.y * 2.5 - t * 0.8) * 0.1;
          float yA = (uv.y + warpA) * 70.0;
          float dA = abs(fract(yA) - 0.5) * 2.0;
          float intA = pow(1.0 - smoothstep(0.0, 0.5, dA), 2.0);
          float xB = (uv.x + warpB) * 70.0;
          float dB = abs(fract(xB) - 0.5) * 2.0;
          float intB = pow(1.0 - smoothstep(0.0, 0.5, dB), 2.0);
          float intensity = max(intA, intB) * 0.75 + min(intA, intB) * 0.35;
          intensity *= 1.0 - uv.y * 0.55;
          vec3 grad = mix(uAccent, uAccent * vec3(0.85, 1.1, 1.2), uv.x);
          return mix(uAccent * 0.05, grad, intensity);
        }

        // 5 — Aave: concentric ring lines pulsing outward with color cycle.
        vec3 m5(vec2 uv) {
          vec2 p = uv - 0.5;
          float r = length(p);
          float t = uTime * 0.25;
          float radial = r * 70.0 - t * 1.8;
          float d = abs(fract(radial) - 0.5) * 2.0;
          float intensity = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
          intensity *= 1.0 - uv.y * 0.55;
          vec3 c1 = uAccent;
          vec3 c2 = uAccent * vec3(1.0, 0.8, 1.2);
          vec3 grad = mix(c1, c2, 0.5 + 0.5 * sin(t * 0.7));
          return mix(uAccent * 0.06, grad, intensity);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / uRes;
          vec3 c;
          if (uVariant == 0) c = m0(uv);
          else if (uVariant == 1) c = m1(uv);
          else if (uVariant == 2) c = m2(uv);
          else if (uVariant == 3) c = m3(uv);
          else if (uVariant == 4) c = m4(uv);
          else c = m5(uv);
          gl_FragColor = vec4(c, 1.0);
        }
      `;

      // Mounts only while isSelected is true. The teardown cancels the
      // rAF loop and explicitly loses the WebGL context so GPU memory
      // is released when the user collapses the card.
      function ShaderCanvas({ variant, accent, isSelected, isHovered }) {
        // Active = either selected or hovered. Drives both the color
        // bloom (saturation) and the rAF loop. Hovering a non-selected
        // card brings its shader to life in the same way selecting does.
        const isActive = isSelected || isHovered;
        const canvasRef = useRef(null);

        // Holds the live gl context + uTime uniform location so the
        // animation effect can drive frames without re-running the
        // expensive shader compile each time isSelected toggles.
        const ctxRef = useRef(null);

        // Setup: compile program, upload geometry, render one static
        // frame at t=0. preserveDrawingBuffer:true keeps that frame
        // visible after the rAF loop stops, so collapsed cards show
        // the same shader look as the start of the animation.
        // useLayoutEffect runs before the browser paints so the first
        // shader frame is on screen at the same time as the rest of
        // the card, with no gradient-to-shader flash on initial load.
        useLayoutEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = 376 * dpr;
          canvas.height = 200 * dpr;

          // Graceful fallback shared by every failure path (no WebGL, compile
          // or link error — e.g. software renderers): flat accent gradient so
          // the hero never renders empty.
          const fallback = () => {
            canvas.style.background = `radial-gradient(120% 140% at 30% 20%, color-mix(in srgb, ${accent} 38%, #0e0f12) 0%, #0e0f12 75%)`;
          };
          const gl = canvas.getContext("webgl", {
            antialias: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
          });
          if (!gl) { fallback(); return; }

          const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
              console.error("Shader compile error:", gl.getShaderInfoLog(s));
              return null;
            }
            return s;
          };

          const vs = compile(gl.VERTEX_SHADER, SHADER_VS);
          const fs = compile(gl.FRAGMENT_SHADER, SHADER_FS);
          if (!vs || !fs) { fallback(); return; }

          const prog = gl.createProgram();
          gl.attachShader(prog, vs);
          gl.attachShader(prog, fs);
          gl.linkProgram(prog);
          if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("Program link error:", gl.getProgramInfoLog(prog));
            fallback();
            return;
          }

          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1, 1, 1,
          ]), gl.STATIC_DRAW);

          gl.useProgram(prog);
          const aLoc = gl.getAttribLocation(prog, "a");
          gl.enableVertexAttribArray(aLoc);
          gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

          const uTime = gl.getUniformLocation(prog, "uTime");
          const uRes = gl.getUniformLocation(prog, "uRes");
          const uAcc = gl.getUniformLocation(prog, "uAccent");
          const uVar = gl.getUniformLocation(prog, "uVariant");

          const m = accent.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          const rgb = m ? [+m[1] / 255, +m[2] / 255, +m[3] / 255] : [1, 1, 1];

          gl.uniform2f(uRes, canvas.width, canvas.height);
          gl.uniform3fv(uAcc, rgb);
          gl.uniform1i(uVar, variant);
          gl.viewport(0, 0, canvas.width, canvas.height);

          // Initial static frame so the collapsed card isn't blank.
          gl.uniform1f(uTime, 0);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          ctxRef.current = { gl, uTime };

          return () => {
            // Do NOT loseContext() here: under React StrictMode the effect
            // runs setup → cleanup → setup on the SAME canvas, and a lost
            // WebGL context is permanently lost for that canvas — the second
            // mount would get a dead context (broken-image glyph, empty
            // compile errors). The contexts are reclaimed when the viewer
            // unmounts the canvases entirely.
            ctxRef.current = null;
          };
        }, [variant, accent]);

        // Animation: drive a rAF loop while active (selected or hovered).
        // When it stops, the canvas retains the last drawn frame
        // (preserveDrawingBuffer above), so the card keeps its shader
        // look instead of snapping back to anything else.
        useEffect(() => {
          if (!isActive) return;
          const ctx = ctxRef.current;
          if (!ctx) return;
          const { gl, uTime } = ctx;

          let rafId;
          const start = performance.now();
          const draw = () => {
            const t = (performance.now() - start) / 1000;
            gl.uniform1f(uTime, t);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            rafId = requestAnimationFrame(draw);
          };
          draw();

          return () => cancelAnimationFrame(rafId);
        }, [isActive]);

        return h("canvas", {
          ref: canvasRef,
          className: "card-shader" + (isActive ? " is-active" : ""),
        });
      }

      // sRGB luminance of Chainlink's accent — the target greyscale
      // level that every collapsed shader is normalised to so all
      // greyscale frames read at the same brightness.
      const TARGET_GREY_LUMINANCE = 95;

      function Card({
        title, subtitle, url, ticker, icon, accent, collateral, stats, shaderVariant,
        i, isSelected, selectedIdx, onClick, flatHero = false,
      }) {
        // Top of array (i=0) gets lowest z; bottom (i=N-1) is highest and sits on top.
        // When a card is selected it must paint above the others as they exit.
        const z = isSelected ? N + 1 : i + 1;
        const ty = (i - (N - 1) / 2) * ROW_PITCH;

        // Per-card brightness factor applied to the greyscale state.
        // A warm accent (Maple/Spark) desaturates to a brighter grey
        // than a cool one (Chainlink), so we scale by the ratio of
        // luminances to pin every collapsed frame to the same level.
        const accMatch = accent.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        const accentLum = accMatch
          ? 0.299 * +accMatch[1] + 0.587 * +accMatch[2] + 0.114 * +accMatch[3]
          : 128;
        const greyBrightness = (TARGET_GREY_LUMINANCE / accentLum).toFixed(3);
        // Cards below the selected one shift up by a slot to fill the gap
        // it left behind. Cards above the selection stay put.
        const shiftUp = selectedIdx !== null && !isSelected && i > selectedIdx;
        const tyLeft = shiftUp ? ty - ROW_PITCH : ty;

        // The extra-content block is absolutely positioned, so the card
        // can't auto-size to it. Measure where it actually ends and set
        // the expanded height to leave a 12px bottom margin matching the
        // top padding. Re-measure after web fonts load, since text wrap
        // (and therefore the block's height) can shift once Inter swaps in.
        const extraRef = useRef(null);
        const [expandedH, setExpandedH] = useState(null);
        const [isHovered, setIsHovered] = useState(false);
        // CTA state machine: idle → loading → sending → sent.
        // - loading (1.2s): bouncy dots simulate the async request
        // - sending (2s): plane soars across (~1s), then "Request sent"
        //   rolls up letter by letter in a rolodex slot
        // - sent: button disables and surface slowly fades to muted
        const [ctaState, setCtaState] = useState("idle");
        const ctaTimeoutRef = useRef(null);
        useEffect(() => {
          return () => {
            if (ctaTimeoutRef.current) clearTimeout(ctaTimeoutRef.current);
          };
        }, []);
        useEffect(() => {
          const el = extraRef.current;
          if (!el) return;
          const measure = () => setExpandedH(el.offsetTop + el.offsetHeight + 12);
          measure();
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(measure);
          }
        }, []);

        const statsEl = h(
          "div",
          { className: "card-stats" },
          stats.map((s, si) =>
            h(
              "div",
              { key: si, className: "card-stat" },
              h("span", { className: "label" }, s.label),
              h(
                "span",
                { className: "value" },
                s.value,
                s.unit ? h("span", { className: "unit" }, s.unit) : null
              )
            )
          )
        );

        // Accepted-collateral line: a body-copy paragraph with a muted
        // prefix label, sized as a single line of structured data.
        const collateralEl = h(
          "p",
          { className: "card-collateral" },
          h("span", { className: "prefix" }, "Accepted collateral: "),
          collateral
        );

        return h(
          "article",
          {
            className: "card" + (isSelected ? " is-selected" : ""),
            onClick,
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
            style: {
              "--z": z,
              "--ty": ty + "px",
              "--ty-left": tyLeft + "px",
              "--top-ty": TOP_TY + "px",
              "--accent": accent,
              "--grey-brightness": greyBrightness,
              "--expanded-h": expandedH ? expandedH + "px" : undefined,
            },
          },
          h(
            "div",
            { className: "card-hero" },
            flatHero
              ? h("div", {
                  className: "card-shader" + (isSelected || isHovered ? " is-active" : ""),
                  style: { background: `radial-gradient(120% 140% at 30% 20%, color-mix(in srgb, ${accent} 38%, #0e0f12) 0%, #0e0f12 75%)` },
                })
              : h(ShaderCanvas, { variant: shaderVariant, accent, isSelected, isHovered }),
            icon
              ? h("img", { className: "card-hero-icon", src: icon, alt: "" })
              : h("span", { className: "card-hero-ticker" }, ticker)
          ),
          h(
            "div",
            { className: "card-text" },
            h(
              "div",
              { className: "card-text-inner" },
              h("h3", { className: "card-title" }, title),
              h("p", { className: "card-subtitle" }, subtitle)
            ),
            h(
              flatHero ? "span" : "a",
              flatHero ? { className: "card-linkout" } : {
                className: "card-linkout",
                href: url,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": "Visit " + title,
                // Stop the card's onClick so opening the link doesn't
                // also toggle the expand/collapse state of the card.
                onClick: (e) => e.stopPropagation(),
              },
              h("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
                h("path", { d: "M4.5 11.5 11.5 4.5M6 4.5h5.5V10", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }))
            )
          ),
          h(
            "div",
            { className: "card-extra", ref: extraRef },
            collateralEl,
            statsEl,
            h(
              flatHero ? "div" : "button",
              flatHero ? { className: "card-cta" } : {
                type: "button",
                className: "card-cta" + (ctaState === "sent" ? " is-sent" : ""),
                disabled: ctaState !== "idle",
                // Stop the card's onClick so pressing the CTA doesn't
                // also collapse the card. Walks the button through
                // loading → sending → sent on staggered timeouts.
                onClick: (e) => {
                  e.stopPropagation();
                  if (ctaState !== "idle") return;
                  setCtaState("loading");
                  ctaTimeoutRef.current = setTimeout(() => {
                    setCtaState("sending");
                    ctaTimeoutRef.current = setTimeout(() => {
                      setCtaState("sent");
                      ctaTimeoutRef.current = null;
                    }, 2000);
                  }, 1200);
                },
              },
              ctaState === "loading" && h(
                "span",
                { className: "card-cta-spinner" },
                h("span"),
                h("span"),
                h("span")
              ),
              ctaState === "sending" && h(
                "span",
                { className: "card-cta-plane" },
                h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true },
                  h("path", { d: "M3.4 20.4 20.85 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" }))
              ),
              ctaState === "idle" ? "Add counterparty" :
                ctaState === "loading" ? "Adding..." :
                  h(
                    "span",
                    { className: "card-cta-rolodex" },
                    "Request sent".split("").map((char, i) =>
                      h(
                        "span",
                        {
                          key: i,
                          // Letters start rolling in after the plane has
                          // flown across (1s), then each follows 0.035s
                          // behind the previous for a staggered wave.
                          style: { animationDelay: (1 + i * 0.035) + "s" },
                        },
                        char === " " ? " " : char
                      )
                    )
                  )
            )
          )
        );
      }

      // Default: vertical lineup. Click a card → others exit left, picked
      // card rides up to the top slot and morphs into a tall vertical layout.
      function CardStackerFull() {
        const [selected, setSelected] = useState(null);

        const reset = () => setSelected(null);

        return h(
          "div",
          {
            className: "stage",
            onClick: reset,
          },
          h(
            "div",
            { className: "stack" + (selected !== null ? " selected" : "") },
            CARDS.map((c, i) =>
              h(Card, {
                key: i,
                i,
                ...c,
                isSelected: selected === i,
                selectedIdx: selected,
                onClick: (e) => {
                  e.stopPropagation();
                  if (selected === i) reset();
                  else setSelected(i);
                },
              })
            )
          )
        );
      }

      // ── Tile micro-moment: mini stack that auto-cycles the select morph.
      // Shaders are replaced by flat accent heroes (flatHero) — six WebGL
      // contexts on the home page would break the perf rules.
      const TILE_DWELL = 2600
      const TILE_GAP = 900

      function CardStackerTile() {
        const [selected, setSelected] = useState(null)
        const idxRef = useRef(0)
        useEffect(() => {
          let t
          const cycle = () => {
            setSelected(idxRef.current)
            t = setTimeout(() => {
              setSelected(null)
              idxRef.current = (idxRef.current + 1) % N
              t = setTimeout(cycle, TILE_GAP)
            }, TILE_DWELL)
          }
          t = setTimeout(cycle, 700)
          return () => clearTimeout(t)
        }, [])

        return h(
          "div",
          {
            className: "cs cs-tile",
            "aria-hidden": true,
            inert: true,
            style: {
              position: "absolute", inset: 0, overflow: "hidden",
              pointerEvents: "none", borderRadius: "inherit",
              display: "grid", placeItems: "center",
            },
          },
          h(
            "div",
            { style: { transform: "scale(0.34)", transformOrigin: "center 40%" } },
            h(
              "div",
              { className: "stack" + (selected !== null ? " selected" : "") },
              CARDS.map((c, i) =>
                h(Card, {
                  key: i,
                  i,
                  ...c,
                  flatHero: true,
                  isSelected: selected === i,
                  selectedIdx: selected,
                  onClick: () => {},
                })
              )
            )
          )
        )
      }

      export default function CardStacker({ variant = "full" }) {
        if (variant === "tile") return h(CardStackerTile)
        return h("div", { className: "cs" }, h(CardStackerFull))
      }
    