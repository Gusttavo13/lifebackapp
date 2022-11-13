/* eslint-disable prettier/prettier */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable semi */


import React, { useMemo } from 'react';
import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';

const CustomSheet: React.FC<BottomSheetBackgroundProps> = ({
  style,
  animatedIndex,
}) => {
  //#region styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    // @ts-ignore
    borderTopLeftRadius: 50,
    backgroundColor: interpolateColor(
      animatedIndex.value,
      [0, 1],
      ['#1d4ed8', '#1841b5']
    ),
  }));
  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );
  //#endregion

  // render
  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default CustomSheet;