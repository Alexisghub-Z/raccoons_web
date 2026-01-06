import './Skeleton.css';

function Skeleton({ variant = 'text', width, height, className = '' }) {
  const skeletonClass = `skeleton skeleton-${variant} ${className}`;
  const style = {};

  if (width) style.width = width;
  if (height) style.height = height;

  return <div className={skeletonClass} style={style} />;
}

export default Skeleton;
