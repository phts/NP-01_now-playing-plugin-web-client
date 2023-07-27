export interface StylesBundleProps {
  styles?: {
    baseClassName?: string;
    extraClassNames?: string[];
    bundle?: Record<string, string>;
  };
}
