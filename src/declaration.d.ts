declare module '*.png';
declare module '*.gif';
declare module '*.scss' {
  const content: Record<string, any>;
  export default content;
}
