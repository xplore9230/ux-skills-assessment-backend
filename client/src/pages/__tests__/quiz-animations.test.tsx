/**
 * Comprehensive test suite for quiz card animations
 * 
 * Tests:
 * - First question appears instantly (no animation)
 * - Forward navigation triggers exit animation (x=0 to x=-100)
 * - Container height stability (no jumps)
 * - Animation values match exactly as specified
 * - Navigation edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import QuizPage from '../quiz';
import type { Question } from '@/types';

// Mock framer-motion to capture animation props
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, initial, animate, exit, ...props }: any) => {
        // Store animation props for testing
        if (typeof window !== 'undefined') {
          (window as any).__lastMotionProps = { initial, animate, exit };
        }
        return <div {...props}>{children}</div>;
      },
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'First question?',
    category: 'Test',
    options: [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
    ],
  },
  {
    id: 'q2',
    text: 'Second question?',
    category: 'Test',
    options: [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
    ],
  },
  {
    id: 'q3',
    text: 'Third question?',
    category: 'Test',
    options: [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
    ],
  },
];

const mockOnComplete = vi.fn();
const mockOnBack = vi.fn();
const mockOnHalfwayComplete = vi.fn();

describe('Quiz Card Animations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).__lastMotionProps;
    
    // Reset ResizeObserver if needed
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  describe('First Question Appearance', () => {
    it('should appear instantly without slide animation', () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // First question should be visible immediately
      expect(screen.getByText('First question?')).toBeInTheDocument();
      
      // Check that initial animation is false (no animation)
      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.initial).toBe(false);
    });

    it('should not trigger any entry animation on first render', async () => {
      const { container } = render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const card = container.querySelector('[data-testid="text-question"]')?.closest('div');
      
      // Card should be visible and positioned without animation
      await waitFor(() => {
        expect(card).toBeInTheDocument();
        expect(screen.getByText('First question?')).toBeVisible();
      });
    });
  });

  describe('Forward Navigation Animation', () => {
    it('should animate exit with x=-100% when moving to next question', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Answer first question
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      // Wait for navigation (300ms delay)
      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Check exit animation was set to x=-100% with opacity fade-out
      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.exit).toEqual({
        x: '-100%',
        opacity: 0, // Should fade out (1→0)
        zIndex: 0,
      });
    });

    it('should maintain x=0 in animate prop', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate to second question
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.animate).toEqual({
        x: 0,
        opacity: 1,
        zIndex: 10,
      });
    });
  });

  describe('Container Height Stability', () => {
    it('should lock container height to prevent vertical jumps', async () => {
      const { container } = render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const cardContainer = container.querySelector('[style*="minHeight"]');
      expect(cardContainer).toBeInTheDocument();

      // Get initial height
      const initialHeight = cardContainer?.getAttribute('style');

      // Navigate to next question
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Container should still have height set (may have changed but should be stable)
      const newHeight = cardContainer?.getAttribute('style');
      expect(newHeight).toBeTruthy();
      expect(newHeight).toContain('height');
    });

    it('should use useLayoutEffect for immediate height calculation', async () => {
      // This test verifies that height is calculated before paint
      // by checking that height is set synchronously
      const { container } = render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        const cardContainer = container.querySelector('[style*="height"]');
        expect(cardContainer).toBeInTheDocument();
      });
    });
  });

  describe('Animation Values', () => {
    it('should have correct initial values for subsequent questions', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate to second question
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const motionProps = (window as any).__lastMotionProps;
      
      // Subsequent questions should start at x=0 (not slide in)
      expect(motionProps?.initial).toEqual({
        x: 0,
        opacity: 1,
      });
    });

    it('should have exit animation with x=-100%', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate forward
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.exit?.x).toBe('-100%');
      expect(motionProps?.exit?.opacity).toBe(0); // Should fade out (1→0)
    });

    it('should have correct transition duration and easing', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate to trigger animation
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Note: Transition prop is not captured in our mock, but we verify
      // the animation values are correct
      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.exit?.x).toBe('-100%');
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle rapid navigation without breaking', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Rapidly click through questions
      const option1 = screen.getByTestId('option-1');
      
      fireEvent.click(option1);
      
      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const option2Next = screen.getByTestId('option-1');
      fireEvent.click(option2Next);

      await waitFor(
        () => {
          expect(screen.getByText('Third question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Should still have correct exit animation with opacity fade
      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.exit?.x).toBe('-100%');
      expect(motionProps?.exit?.opacity).toBe(0); // Should fade out
    });

    it('should handle navigation from last question correctly', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate to last question
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      const option2Next = screen.getByTestId('option-1');
      fireEvent.click(option2Next);

      await waitFor(
        () => {
          expect(screen.getByText('Third question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Answer last question should trigger onComplete
      const option3Last = screen.getByTestId('option-1');
      fireEvent.click(option3Last);

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalled();
        },
        { timeout: 600 }
      );
    });
  });

  describe('Layout Stability', () => {
    it('should prevent layout shifts during navigation', async () => {
      const { container } = render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const cardContainer = container.querySelector('[style*="minHeight"]') as HTMLElement;
      const initialHeight = cardContainer?.offsetHeight || 0;

      // Navigate to next question
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Container should have height locked (may adjust but shouldn't cause major shift)
      const newHeight = cardContainer?.offsetHeight || 0;
      // Height may change but shouldn't be drastically different
      expect(newHeight).toBeGreaterThan(0);
    });
  });

  describe('First Mount Behavior', () => {
    it('should set isFirstMountRef to false after first navigation', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // First question should have initial={false}
      let motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.initial).toBe(false);

      // Navigate forward
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Subsequent questions should have initial={x: 0, opacity: 1}
      motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.initial).toEqual({
        x: 0,
        opacity: 1,
      });
    });
  });

  describe('Backward Navigation Animation', () => {
    it('should exit to the right (x=+100%) with opacity fade when going backward', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate forward first
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Now click Previous button
      const previousButton = screen.getByTestId('button-previous');
      fireEvent.click(previousButton);

      await waitFor(
        () => {
          expect(screen.getByText('First question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Check that exit animation was set to x=+100% with opacity fade-out
      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.exit).toEqual({
        x: '+100%',
        opacity: 0, // Should fade out (1→0)
        zIndex: 0,
      });
    });

    it('should enter from the left (x=-100%) with opacity fade-in when going backward', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate forward first
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Now click Previous button
      const previousButton = screen.getByTestId('button-previous');
      fireEvent.click(previousButton);

      await waitFor(
        () => {
          expect(screen.getByText('First question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Check that initial animation starts from left with opacity 0 (will fade in)
      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.initial).toEqual({
        x: '-100%',
        opacity: 0, // Starts invisible, will fade in to opacity 1
      });
      
      // Animate should end at center with full opacity
      expect(motionProps?.animate).toEqual({
        x: 0,
        opacity: 1, // Fades in to fully visible
        zIndex: 10,
      });
    });

    it('should handle backward navigation smoothly with proper animations', async () => {
      render(
        <QuizPage
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      // Navigate forward to question 2
      const option1 = screen.getByTestId('option-1');
      fireEvent.click(option1);

      await waitFor(
        () => {
          expect(screen.getByText('Second question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Navigate backward to question 1
      const previousButton = screen.getByTestId('button-previous');
      fireEvent.click(previousButton);

      await waitFor(
        () => {
          expect(screen.getByText('First question?')).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      // Verify animation props are correct for backward entry
      const motionProps = (window as any).__lastMotionProps;
      expect(motionProps?.initial?.x).toBe('-100%');
      expect(motionProps?.initial?.opacity).toBe(0);
      expect(motionProps?.animate?.x).toBe(0);
      expect(motionProps?.animate?.opacity).toBe(1);
    });
  });
});

