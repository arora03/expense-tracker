import { useEffect, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useStore } from '@/store/useStore';

export default function SquirrelTour() {
  const { hasCompletedTour, hasCompletedOnboarding, completeTour } = useStore();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour if they have finished the onboarding name modal, and haven't completed the tour yet.
    if (hasCompletedOnboarding && !hasCompletedTour) {
      // Small delay so the UI fully renders first
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, hasCompletedTour]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      completeTour();
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-center p-4">
          <div className="text-6xl mb-4">🐿️</div>
          <h2 className="text-2xl font-bold mb-2">Hi! I'm Nutty!</h2>
          <p className="text-muted-foreground">
            Welcome to your new financial dashboard! Let me show you around so you can start saving those nuts!
          </p>
        </div>
      ),
    },
    {
      target: '.tour-sidebar',
      content: (
        <div>
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <span>🐿️</span> Your Nav Tree
          </h3>
          <p className="text-sm text-muted-foreground">
            Here is where you can hop between your Expenses, Subscriptions, and Savings Goals!
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-electricity',
      content: (
        <div>
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <span>🐿️</span> Don't go dark!
          </h3>
          <p className="text-sm text-muted-foreground">
            Keep an eye on your Electricity Wallet. I'll automatically deduct your daily usage so you never get caught off guard! ⚡
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.tour-dashboard-stats',
      content: (
        <div>
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <span>🐿️</span> The Big Picture
          </h3>
          <p className="text-sm text-muted-foreground">
            This dashboard will show you exactly where your money is going every month. Time to get tracking! 🥜
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
    />
  );
}
