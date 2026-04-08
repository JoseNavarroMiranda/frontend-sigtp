import fondoImagen from '../../assets/fondologin.jpg';


const Background = ({ children }) => {
  const styles = {
    backgroundContainer: {
      backgroundImage: ` linear-gradient(
      rgba(0, 50, 130, 0.5),
      rgba(0, 50, 130, 0.5)
    ),url(${fondoImagen})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  return (
    <div style={styles.backgroundContainer}>
      {children}
    </div>
  );
};

export default Background;