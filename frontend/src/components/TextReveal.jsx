import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Word = ({ children, progress, range }) => {
    const opacity = useTransform(progress, range, [0.2, 1]);
    const isSpecial = children.includes("66") || children.includes("días") || children.includes("matemático");
    const color = useTransform(progress, range, ["var(--color-textMuted)", isSpecial ? "var(--color-accent)" : "var(--color-textPrimary)"]);

    return (
        <span className="relative mr-2 md:mr-3 mt-2 inline-block">
            <span className="absolute opacity-20">{children}</span>
            <motion.span style={{ opacity, color }}>{children}</motion.span>
        </span>
    );
};

const TextReveal = ({ text }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 70%", "end 70%"]
    });

    const words = text.split(" ");

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto py-12">
            <p className="flex flex-wrap text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] md:leading-[1.1] tracking-tight">
                {words.map((word, i) => {
                    const step = 1 / words.length;
                    const start = i * step;
                    const end = start + step;
                    return (
                        <Word key={i} progress={scrollYProgress} range={[start, end]}>
                            {word}
                        </Word>
                    );
                })}
            </p>
        </div>
    );
};

export default TextReveal;
