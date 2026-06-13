import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { tourSteps } from '../../config/tourSteps';

export default function AppTour({ manualRun, onTourEnd }) {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (!user) return;
    // Map role strictly to config keys
    let roleKey = 'client';
    if (user.role === 'admin') roleKey = 'admin';
    if (user.role === 'expert') roleKey = 'expert';

    const currentSteps = tourSteps[roleKey]?.[location.pathname];
    
    if (currentSteps && currentSteps.length > 0) {
      setSteps(currentSteps);
      
      if (manualRun) {
        // Triggered by button
        setRun(true);
      } else {
        // Auto check
        const completedTours = JSON.parse(localStorage.getItem('egcn_completed_tours') || '[]');
        if (!completedTours.includes(location.pathname)) {
          // Delay start slightly for transitions
          setTimeout(() => setRun(true), 500);
        }
      }
    } else {
      setRun(false);
      // Reset manual run if no steps
      if (manualRun && onTourEnd) onTourEnd();
    }
  }, [location.pathname, user, manualRun, onTourEnd]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Save completion
      const completedTours = JSON.parse(localStorage.getItem('egcn_completed_tours') || '[]');
      if (!completedTours.includes(location.pathname)) {
        completedTours.push(location.pathname);
        localStorage.setItem('egcn_completed_tours', JSON.stringify(completedTours));
      }
      
      if (onTourEnd) onTourEnd();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: '#1A1A1A',
          backgroundColor: '#1A1A1A',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          primaryColor: '#e11d48', // Tailwind rose-600 to match theme potentially, or red-500
          textColor: '#f5f5f0',
          zIndex: 9999,
        },
        tooltip: {
          borderRadius: '8px',
          padding: '20px',
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          backgroundColor: '#e11d48',
          borderRadius: '6px',
          color: '#fff',
          padding: '8px 16px',
          fontWeight: 'bold',
        },
        buttonBack: {
          color: '#8C8C8C',
          marginRight: '10px',
        },
        buttonSkip: {
          color: '#8C8C8C',
          fontWeight: 'bold',
        }
      }}
    />
  );
}
