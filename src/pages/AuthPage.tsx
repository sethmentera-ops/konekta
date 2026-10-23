// Awtomatikong unli pop-up tuwing bubuksan sa browser kapag hindi pa naka-install sa device
  useEffect(() => {
    if (!isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);