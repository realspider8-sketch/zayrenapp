import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    cancelAnimation,
    Easing,
    interpolate,
} from 'react-native-reanimated';

interface ZLogoProps {
    status: 'idle' | 'typing' | 'processing' | 'success';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function ZLogo({ status }: ZLogoProps) {
    // Animation values
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const glow = useSharedValue(0.3);
    const rotateY = useSharedValue(0);
    const colorShift = useSharedValue(0);

    useEffect(() => {
        // Reset/Cancel previous ongoing animations
        cancelAnimation(scale);
        cancelAnimation(rotation);
        cancelAnimation(glow);
        cancelAnimation(rotateY);
        cancelAnimation(colorShift);

        if (status === 'idle') {
            // Gentle breathing pulse and subtle glow shift
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.97, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            glow.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 2000 }),
                    withTiming(0.2, { duration: 2000 })
                ),
                -1,
                true
            );
            rotation.value = withTiming(0, { duration: 500 });
            rotateY.value = withTiming(0, { duration: 500 });
        } else if (status === 'typing') {
            // Energetic scale up, slightly tilted
            scale.value = withTiming(1.1, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
            glow.value = withTiming(0.7, { duration: 300 });
            // Gentle tilt as if observing input
            rotateY.value = withRepeat(
                withSequence(
                    withTiming(15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-15, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else if (status === 'processing') {
            // High-speed energetic state - spinning + 3D flipping + color pulsing
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.05, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            glow.value = withRepeat(
                withSequence(
                    withTiming(1.0, { duration: 400 }),
                    withTiming(0.4, { duration: 400 })
                ),
                -1,
                true
            );
            // Infinite spin
            rotation.value = withRepeat(
                withTiming(360, { duration: 2000, easing: Easing.linear }),
                -1,
                false
            );
            // Rapid 3D flip
            rotateY.value = withRepeat(
                withTiming(360, { duration: 1500, easing: Easing.linear }),
                -1,
                false
            );
            // Fast color shift value
            colorShift.value = withRepeat(
                withTiming(1, { duration: 1000, easing: Easing.linear }),
                -1,
                false
            );
        } else if (status === 'success') {
            // Explode scale and flatten angles
            scale.value = withTiming(1.5, { duration: 400, easing: Easing.out(Easing.quad) });
            glow.value = withTiming(1.0, { duration: 300 });
            rotation.value = withTiming(0, { duration: 400 });
            rotateY.value = withTiming(0, { duration: 400 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // Animated styles
    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}deg` },
                { rotateY: `${rotateY.value}deg` },
            ],
            shadowOpacity: glow.value,
            shadowRadius: interpolate(glow.value, [0.2, 1.0], [8, 25]),
            elevation: interpolate(glow.value, [0.2, 1.0], [4, 15]),
        };
    });

    return (
        <View style={styles.outerContainer}>
            <Animated.View style={[styles.logoContainer, containerStyle]}>
                {/* Top Horizontal Bar (Magenta/Purple/Indigo) */}
                <AnimatedLinearGradient
                    colors={['#FF007F', '#A020F0', '#4B0082']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.segment, styles.topBar]}
                />

                {/* Diagonal Bar (Indigo/Cyan/Emerald) */}
                <AnimatedLinearGradient
                    colors={['#4B0082', '#00FCFF', '#00FF88']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.segment, styles.diagonalBar]}
                />

                {/* Bottom Horizontal Bar (Emerald/Gold/Orange-Red) */}
                <AnimatedLinearGradient
                    colors={['#00FF88', '#FFD700', '#FF3700']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.segment, styles.bottomBar]}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 130,
        height: 130,
        position: 'relative',
        shadowColor: '#00FCFF',
        shadowOffset: { width: 0, height: 0 },
    },
    segment: {
        height: 15,
        borderRadius: 7.5,
        position: 'absolute',
    },
    topBar: {
        width: 120,
        top: 5,
        left: 5,
    },
    bottomBar: {
        width: 120,
        bottom: 5,
        left: 5,
    },
    diagonalBar: {
        width: 150,
        // Calculated rotation and placement to connect top right (125, 5) to bottom left (5, 125)
        transform: [{ rotate: '-46.5deg' }],
        top: 57.5,
        left: -10,
    },
});
