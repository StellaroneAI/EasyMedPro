import React from 'react';
export const Camera: React.FC<any> = ({ children, ...props }) => <div {...props}>{children}</div>;
export enum CameraType {
  back = 'back',
  front = 'front'
}
export async function requestCameraPermissionsAsync() { return { status: 'granted' }; }
