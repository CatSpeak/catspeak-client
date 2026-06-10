import React, { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import ProfileSidebar from "../components/ProfileSidebar"
import { motion, useAnimation, useMotionValue, useSpring } from "framer-motion"

const RandomCircle = ({ colorClass, baseSize, delay }) => {
  const controls = useAnimation()
  
  const initialPosition = React.useMemo(() => ({
    x: (Math.random() - 0.5) * 120 + "vw",
    y: (Math.random() - 0.5) * 120 + "vh",
    scale: Math.random() * 1.0 + 0.5
  }), []);

  useEffect(() => {
    let isActive = true;
    
    const animateCircle = async () => {
      if (delay) await new Promise(r => setTimeout(r, delay * 1000));
      
      while (isActive) {
        const x = (Math.random() - 0.5) * 120 + "vw";
        const y = (Math.random() - 0.5) * 120 + "vh";
        
        // Smaller circles move faster (shorter duration), larger circles move slower
        // baseSize 150 -> ~15s to 25s
        // baseSize 300 -> ~30s to 40s
        const duration = (baseSize / 10) + Math.random() * 10; 
        
        if (!isActive) break;
        await controls.start({
          x, y,
          transition: { duration, ease: "easeInOut" }
        });
      }
    };
    
    animateCircle();
    return () => { isActive = false; }
  }, [controls, delay]);

  return (
    <motion.div
      initial={initialPosition}
      animate={controls}
      className={`absolute top-1/2 left-1/2 rounded-full mix-blend-multiply ${colorClass}`}
      style={{
        width: baseSize,
        height: baseSize,
        marginLeft: -baseSize / 2,
        marginTop: -baseSize / 2,
      }}
    />
  )
}

const BackgroundCircles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50/50">
      <RandomCircle colorClass="bg-gradient-to-br from-red-500 to-rose-400 opacity-60" baseSize={250} delay={0} />
      <RandomCircle colorClass="bg-gradient-to-tr from-rose-500 to-orange-400 opacity-50" baseSize={300} delay={2} />
      <RandomCircle colorClass="bg-gradient-to-bl from-red-400 to-pink-500 opacity-60" baseSize={200} delay={4} />
      <RandomCircle colorClass="bg-gradient-to-tl from-red-600 to-orange-500 opacity-40" baseSize={150} delay={1} />
      <RandomCircle colorClass="bg-gradient-to-r from-rose-400 to-red-400 opacity-50" baseSize={250} delay={3} />
    </div>
  )
}

const ProfileLayout = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 lg:overflow-hidden relative z-0">
      <BackgroundCircles />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[320px] flex-shrink-0 overflow-y-auto">
        <ProfileSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col">
        {/* Mobile Tabs */}
        <div className="px-6 lg:hidden sticky top-0 z-10 bg-white overflow-hidden flex-shrink-0">
          <ProfileSidebar variant="horizontal" />
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-[1040px] min-w-0 p-5 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default ProfileLayout
