'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PrimaryButton, SecondaryButton, OutlineButton, NavButton } from './components/Button';

export default function Home() {
  return (
    <div className="overflow relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/background.png"
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50">
          <div className="container mx-auto px-6 py-5">
            <nav className="flex items-center justify-between">
              <div className="flex gap-14">
                <Link href="/" className="group flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      width={70}
                      height={70}
                      className="relative z-10"
                    />
                  </div>
                </Link>

                <div className="hidden items-center gap-10 text-sm md:flex">
                  <a
                    href="#partners"
                    className="font-medium tracking-wider text-gray-300 uppercase transition-colors hover:text-primary"
                  >
                    Partners
                  </a>
                  <a
                    href="#how-it-works"
                    className="font-medium tracking-wider text-gray-300 uppercase transition-colors hover:text-primary"
                  >
                    How It Works
                  </a>
                  <a
                    href="https://docs.luna402.xyz"
                    className="font-medium tracking-wider text-gray-300 uppercase transition-colors hover:text-primary"
                  >
                    Docs
                  </a>
                  <a
                    href="https://github.com/Luna402-xyz/Luna402"
                    className="font-medium tracking-wider text-gray-300 uppercase transition-colors hover:text-primary"
                  >
                    Github
                  </a>
                  <a
                    href="#tokenomics"
                    className="font-medium tracking-wider text-gray-300 uppercase transition-colors hover:text-primary"
                  >
                    $LUNA
                  </a>
                </div>
              </div>
              <NavButton href="/app">Launch App</NavButton>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-10">
          <div className="container relative mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 font-display leading-tighter text-white text-7xl md:text-[5rem]"
              >
                The Future of x402 Commerce
                <span className="block text-gradient-primary">
                  {' '}
                  Runs on AI
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-3xl mb-10 text-lg leading text-gray-300"
              >
                Luna402 is your x402 AI payment agent that never sleeps. Access premium APIs, data feeds, and digital services instantly. No accounts, no approvals, just seamless transactions powered by the x402 protocol.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-16 flex flex-col items-center gap-4 sm:flex-row"
              >
                <PrimaryButton href="/app">Start Paying Autonomously</PrimaryButton>
                <SecondaryButton href="#how-it-works">See How It Works</SecondaryButton>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="grid grid-cols-2 gap-6 md:grid-cols-4"
              >
                <div className="group border border-purple-500/20 bg-white/0 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary">
                  <div className="mb-2 font-display text-6xl mb-1 font-light text-white">0%</div>
                  <div className="text-sm font-medium text-gray-300">Fees for $LUNA Holders</div>
                </div>
                <div className="group border border-purple-500/20 bg-white/0 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary">
                  <div className="mb-2 font-display text-6xl mb-1 font-light text-white">&lt;2s</div>
                  <div className="text-sm font-medium text-gray-300">Lightning Fast Settlement</div>
                </div>
                <div className="group border border-purple-500/20 bg-white/0 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary">
                  <div className="mb-2 font-display text-6xl mb-1 font-light text-white">24/7</div>
                  <div className="text-sm font-medium text-gray-300">Always Active</div>
                </div>
                <div className="group border border-purple-500/20 bg-white/0 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary">
                  <div className="mb-2 font-display text-6xl mb-1 font-light text-white">Multi</div>
                  <div className="text-sm font-medium text-gray-300">Chain Compatible</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Data Sources Section */}
        <section className="mx-auto overflow-hidden bg-primary/10 px-0 py-16 backdrop-blur-xl border-y border-purple-500/20">
          <div className="mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 max-w-6xl mx-auto"
            >
              <h3 className="text-4xl font-display tracking-[0.01em] font-semibold text-white">
                Powered by the x402 Open Protocol
              </h3>
              <p className="mt-4 max-w-3xl text-gray-200">
                Connect to a growing ecosystem of premium APIs and services. Pay-per-use pricing, instant access, zero platform friction.
              </p>
            </motion.div>

            <div className="relative">
              <div className="logo-scroll-container">
                <div className="logo-scroll-track">
                  {/* First set of logos */}
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/heurist-mesh.png"
                      alt="Heurist Mesh"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/pinata.png"
                      alt="Pinata"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/thirdweb-logo.png"
                      alt="thirdweb"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/neynar.png"
                      alt="Neynar"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/zyte-api-x402.png"
                      alt="Zyte API"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/aurracloud.png"
                      alt="AurraCloud"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/x402scan.png"
                      alt="x402scan"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>

                  {/* Duplicate set for seamless loop */}
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/heurist-mesh.png"
                      alt="Heurist Mesh"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/pinata.png"
                      alt="Pinata"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/thirdweb-logo.png"
                      alt="thirdweb"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/neynar.png"
                      alt="Neynar"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/zyte-api-x402.png"
                      alt="Zyte API"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/aurracloud.png"
                      alt="AurraCloud"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                  <div className="logo-item">
                    <Image
                      src="https://www.x402.org/logos/x402scan.png"
                      alt="x402scan"
                      width={160}
                      height={160}
                      className="brightness-110 transition-all hover:brightness-120"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-7xl">
            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-white font-display mb-4 text-5xl italic md:text-6xl">
                Partners
              </h2>
            </motion.div>

            {/* Partners Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-16 md:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex items-center justify-center"
              >
                <Image
                  src="/partners/layerzero.png"
                  alt="LayerZero"
                  width={200}
                  height={80}
                  className="h-auto invert w-full max-w-[200px] object-contain transition-all"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex items-center justify-center"
              >
                <Image
                  src="/partners/caladan.png"
                  alt="Caladan"
                  width={200}
                  height={80}
                  className="h-auto grayscale w-full max-w-[200px] object-contain transition-all"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center"
              >
                <Image
                  src="/partners/galxe.png"
                  alt="GALXE"
                  width={200}
                  height={80}
                  className="h-auto invert w-full max-w-[200px] object-contain transition-all"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-center"
              >
                <Image
                  src="/partners/alva.png"
                  alt="Alva"
                  width={200}
                  height={80}
                  className="h-auto w-full max-w-[200px] object-contain transition-all"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Vertical Timeline */}
        <section id="how-it-works" className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-center">
              <h2 className="mb-4 font-display text-white text-4xl md:text-6xl">
                How Luna402 Works
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-gray-200">
                Three simple steps. Zero friction. Complete automation.
              </p>
            </div>

            {/* Vertical Timeline Layout */}
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 transform bg-gradient-to-b from-primary via-primary/40 to-transparent md:block" />

              {/* Step 1 - Left Aligned */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative mb-24"
              >
                <div className="grid items-center gap-8 md:grid-cols-2">
                  {/* Content - Left Side */}
                  <div className="md:text-right">
                    <div className="inline-block max-w-lg border border-primary bg-purple-950/40 backdrop-blur-lg p-10 backdrop-blur-sm md:float-right">
                      <div className="mb-6 flex items-center gap-4 md:flex-row-reverse">
                        <div className="flex-1 md:text-right">
                          <span className="font-display text-7xl font-light text-primary/80">
                            01
                          </span>
                        </div>
                      </div>
                      <h3 className="mb-4 text-2xl font-bold text-primary">
                        Tell Luna What You Need
                      </h3>
                      <p className="mb-6 leading-relaxed text-gray-200">
                        Just describe the service in natural language. Premium APIs, real-time data, or any x402 resource. Luna knows exactly what to do.
                      </p>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex items-center gap-3 md:flex-row-reverse md:justify-end">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Natural language interface</span>
                        </div>
                        <div className="flex items-center gap-3 md:flex-row-reverse md:justify-end">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">No setup or API keys</span>
                        </div>
                        <div className="flex items-center gap-3 md:flex-row-reverse md:justify-end">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Works with entire x402 ecosystem</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline dot - Center */}
                  <div className="absolute left-1/2 hidden -translate-x-1/2 transform items-center justify-center md:flex">
                    <div className="h-2 w-2 bg-gradient-dot" />
                  </div>

                  {/* Empty space - Right Side */}
                  <div className="hidden md:block" />
                </div>
              </motion.div>

              {/* Step 2 - Right Aligned */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative mb-24"
              >
                <div className="grid items-center gap-8 md:grid-cols-2">
                  {/* Empty space - Left Side */}
                  <div className="hidden md:block" />

                  {/* Timeline dot - Center */}
                  <div className="absolute left-1/2 hidden -translate-x-1/2 transform items-center justify-center md:flex">
                    <div className="h-2 w-2 bg-gradient-dot" />
                  </div>

                  {/* Content - Right Side */}
                  <div>
                    <div className="inline-block max-w-lg border border-primary bg-purple-950/40 backdrop-blur-xl p-10 backdrop-blur-sm">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex-1">
                          <span className="font-display text-6xl font-light text-primary/80">
                            02
                          </span>
                        </div>
                      </div>
                      <h3 className="mb-4 text-2xl font-bold text-primary">
                        Luna Pays Instantly
                      </h3>
                      <p className="mb-6 leading-relaxed text-gray-200">
                        Zero manual work. Luna detects payment requirements, executes blockchain transactions, and verifies access—all in under 2 seconds.
                      </p>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Auto-detects payment requirements</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Instant blockchain settlement</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Lightning-fast verification</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 - Left Aligned */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative"
              >
                <div className="grid items-center gap-8 md:grid-cols-2">
                  {/* Content - Left Side */}
                  <div className="md:text-right">
                    <div className="inline-block max-w-lg border border-primary bg-purple-950/40 backdrop-blur-xl p-10 backdrop-blur-sm md:float-right">
                      <div className="mb-6 flex items-center gap-4 md:flex-row-reverse">
                        <div className="flex-1 md:text-right">
                          <span className="font-display text-6xl font-light text-primary/80">
                            03
                          </span>
                        </div>
                      </div>
                      <h3 className="mb-4 text-2xl font-bold text-primary">
                        Get Instant Access
                      </h3>
                      <p className="mb-6 leading-relaxed text-gray-200">
                        Payment confirmed, service unlocked. Your data arrives immediately—formatted, verified, and ready to use. Full transparency, every time.
                      </p>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex items-center gap-3 md:flex-row-reverse md:justify-end">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Immediate resource delivery</span>
                        </div>
                        <div className="flex items-center gap-3 md:flex-row-reverse md:justify-end">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Clean, structured data format</span>
                        </div>
                        <div className="flex items-center gap-3 md:flex-row-reverse md:justify-end">
                          <div className="h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span className="flex-1">Full transaction history</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline dot - Center */}
                  <div className="absolute left-1/2 hidden -translate-x-1/2 transform items-center justify-center md:flex">
                    <div className="h-2 w-2 bg-gradient-dot" />
                  </div>

                  {/* Empty space - Right Side */}
                  <div className="hidden md:block" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="tokenomics" className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-20 text-center"
              >
                <h2 className="font-display mb-6 text-5xl md:text-7xl text-white">
                  $LUNA Tokenomics
                </h2>
                <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-300/90 leading-relaxed">
                  Real utility. Real value. 100% of platform fees fuel token buybacks.
                </p>
                <PrimaryButton className='w-fit mx-auto' href="https://pump.fun/coin/3AvhVa3pujWZqPLHY9hPjcjCbLiXs8NZ98jkLVHYpump">
                  Buy $LUNA
                </PrimaryButton>
              </motion.div>

              {/* Main Stats Grid */}
              <div className="mb-16 grid gap-8 md:grid-cols-3">
                {/* Platform Fee Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                  <div className="relative bg-gradient-to-br from-[var(--bg-darker)] to-purple-950/50 border border-purple-500/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
                    {/* Large number */}
                    <div className="mb-6 flex items-baseline gap-2">
                      <span className="font-display text-6xl text-primary">0.75</span>
                      <span className="font-display text-4xl text-primary/60">%</span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-4 text-xl font-bold text-white">
                      Platform Fee
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-gray-300/80">
                      For non-holders. Every cent goes to $LUNA buybacks.
                    </p>

                    {/* Decorative corner */}
                    <div className="absolute bottom-0 right-0 h-16 w-16">
                      <div className="absolute bottom-0 right-0 h-full w-full border-r-2 border-b-2 border-primary/20 transition-all group-hover:border-primary/50" />
                    </div>
                  </div>
                </motion.div>

                {/* Zero Fees Card - Featured */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="group relative md:-mt-4"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-2xl" />

                  <div className="relative bg-gradient-to-br from-primary/20 via-[var(--bg-darker)] to-primary/10 border-2 border-primary p-10 backdrop-blur-xl">
                    {/* Featured badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary px-6 py-1.5">
                      <span className="text-xs font-black text-white tracking-wider">HOLDER'S BENEFIT</span>
                    </div>

                    {/* Large number */}
                    <div className="mb-6 flex items-baseline justify-center gap-2 pt-4">
                      <span className="font-display text-7xl text-primary-light">0.00</span>
                      <span className="font-display text-5xl text-primary/60">%</span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-4 text-center text-2xl font-bold text-white">
                      Zero Fees Forever
                    </h3>

                    {/* Description */}
                    <p className="text-center text-sm leading-relaxed text-gray-300/90">
                      Hold any amount of $LUNA. Unlock unlimited zero-fee transactions. Forever.
                    </p>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 h-8 w-8 border-l-2 border-t-2 border-primary" />
                    <div className="absolute top-0 right-0 h-8 w-8 border-r-2 border-t-2 border-primary" />
                    <div className="absolute bottom-0 left-0 h-8 w-8 border-l-2 border-b-2 border-primary" />
                    <div className="absolute bottom-0 right-0 h-8 w-8 border-r-2 border-b-2 border-primary" />
                  </div>
                </motion.div>

                {/* Buyback Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                  <div className="relative bg-gradient-to-br from-[var(--bg-darker)] to-purple-950/50 border border-purple-500/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
                    {/* Large number */}
                    <div className="mb-6 flex items-baseline gap-2">
                      <span className="font-display text-6xl text-primary">100</span>
                      <span className="font-display text-4xl text-primary/60">%</span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-4 text-xl font-bold text-white">
                      Fee Buybacks
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-gray-300/80">
                      All platform revenue buys $LUNA. Automatic. Verifiable. Relentless.
                    </p>

                    {/* Decorative corner */}
                    <div className="absolute bottom-0 right-0 h-16 w-16">
                      <div className="absolute bottom-0 right-0 h-full w-full border-r-2 border-b-2 border-primary/20 transition-all group-hover:border-primary/50" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-5 blur-3xl" />
                <div className="relative border border-purple-400/20 bg-gradient-to-r from-purple-950/30 via-[var(--bg-darker)]/50 to-purple-950/30 backdrop-blur-xl">
                  {/* Top accent */}
                  <div className="h-0.5 w-full bg-gradient-primary" />

                  <div className="px-8 py-12">
                    <div className="grid gap-8 md:grid-cols-3">
                      <div className="text-center">
                        <div className="mb-4 inline-flex items-center justify-center bg-primary/10">
                          <svg className="h-14 w-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h4 className="mb-2 font-bold text-white">Instant Activation</h4>
                        <p className="text-sm text-gray-300/80">
                          Zero-fee benefits activate the moment you hold $LUNA
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="mb-4 inline-flex items-center justify-center bg-primary/10">
                          <svg className="h-14 w-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="mb-2 font-bold text-white">On-Chain Verified</h4>
                        <p className="text-sm text-gray-300/80">
                          Every buyback transaction is transparent and verifiable
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="mb-4 inline-flex items-center justify-center bg-primary/10">
                          <svg className="h-14 w-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="mb-2 font-bold text-white">Holder-First Model</h4>
                        <p className="text-sm text-gray-300/80">
                          Economics designed to reward long-term $LUNA holders
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div className="h-0.5 w-full bg-gradient-primary" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/15 bg-purple-950/15 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-12">
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div>
                <Link
                  href="/"
                  className="flex w-fit items-center gap-3"
                >
                  <img
                    src="/logo.png"
                    alt="Logo"
                    width={70}
                    height={70}
                  />
                </Link>
                <p className="pt-4 text-sm leading-relaxed text-gray-300">
                  Your autonomous payment agent for
                  <br /> the x402 ecosystem.
                </p>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-primary">Product</h4>
                <ul className="space-y-2 text-sm text-gray-200/70">
                  <li>
                    <a href="#partners" className="transition-colors hover:text-primary">
                      Partners
                    </a>
                  </li>
                  <li>
                    <a href="/#how-it-works" className="transition-colors hover:text-primary">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="/#tokenomics" className="transition-colors hover:text-primary">
                      $LUNA
                    </a>
                  </li>
                  <li>
                    <a href="/app" className="transition-colors hover:text-primary">
                      Launch App
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-primary">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-200/70">
                  <li>
                    <a
                      href="https://docs.luna402.xyz"
                      className="transition-colors hover:text-primary"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Luna402-xyz/Luna402"
                      className="transition-colors hover:text-primary"
                    >
                      Github
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-primary">Community</h4>
                <ul className="space-y-2 text-sm text-gray-200/70">
                  <li>
                    <a
                      href="https://x.com/luna402xyz"
                      className="transition-colors hover:text-primary"
                    >
                      X
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-primary">
                      Telegram
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-purple-500/15 pt-8 md:flex-row">
              <p className="text-sm text-gray-200/60">
                &copy; 2025 Luna402. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
