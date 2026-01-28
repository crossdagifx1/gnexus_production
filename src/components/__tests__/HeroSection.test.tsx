import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { HeroSection } from '../HeroSection';

// Mock GSAP
vi.mock('gsap', () => ({
    gsap: {
        timeline: vi.fn(() => ({
            fromTo: vi.fn().mockReturnThis(),
            to: vi.fn().mockReturnThis(),
        })),
        to: vi.fn(),
        context: vi.fn((callback) => {
            callback();
            return { revert: vi.fn() };
        }),
        registerPlugin: vi.fn(),
    },
}));

describe('HeroSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the main headline', () => {
        render(<HeroSection />);

        expect(screen.getByText(/ancient wisdom/i)).toBeInTheDocument();
        expect(screen.getByText(/futuristic technology/i)).toBeInTheDocument();
    });

    it('displays the G-Nexus badge', () => {
        render(<HeroSection />);

        expect(screen.getByText(/habesha futurism/i)).toBeInTheDocument();
        expect(screen.getByText(/digital excellence/i)).toBeInTheDocument();
    });

    it('renders CTA buttons', () => {
        render(<HeroSection />);

        expect(screen.getByText(/start your project/i)).toBeInTheDocument();
        expect(screen.getByText(/explore platform/i)).toBeInTheDocument();
    });

    it('displays statistics', () => {
        render(<HeroSection />);

        expect(screen.getByText(/50\+/i)).toBeInTheDocument();
        expect(screen.getByText(/projects delivered/i)).toBeInTheDocument();
        expect(screen.getByText(/expert founders/i)).toBeInTheDocument();
    });

    it('includes scroll indicator', () => {
        render(<HeroSection />);

        expect(screen.getByText(/scroll to explore/i)).toBeInTheDocument();
    });

    it('renders floating feature pills', () => {
        render(<HeroSection />);

        expect(screen.getByText(/lightning fast/i)).toBeInTheDocument();
        expect(screen.getByText(/secure/i)).toBeInTheDocument();
        expect(screen.getByText(/global ready/i)).toBeInTheDocument();
    });
});
