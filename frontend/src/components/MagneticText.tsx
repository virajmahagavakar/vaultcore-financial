import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticTextProps {
    children: React.ReactNode;
    className?: string;
}

const MagneticText = ({ children, className = "" }: MagneticTextProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();

        // Calculate center of element
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // Distance from center
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // Movement strength (higher divider = less movement)
        const x = distanceX * 0.5;
        const y = distanceY * 0.5;

        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={`inline-block cursor-none ${className}`} // Add cursor-none here to ensure custom cursor usage
            style={{ display: 'inline-block' }}
        >
            {children}
        </motion.div>
    );
};

export default MagneticText;
