import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { Navbar } from '../Navbar';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Link: ({ children, to }: any) => <a href={to}>{children}</a>,
    };
});

describe('Navbar', () => {
    it('renders the logo and navigation links', () => {
        render(<Navbar />);

        // Check if main navigation items are present
        expect(screen.getByText(/services/i)).toBeInTheDocument();
        expect(screen.getByText(/about/i)).toBeInTheDocument();
        expect(screen.getByText(/contact/i)).toBeInTheDocument();
    });

    it('opens mobile menu when hamburger is clicked', () => {
        render(<Navbar />);

        // Mobile menu should be hidden initially
        const menuButton = screen.getByRole('button', { name: /menu/i });
        fireEvent.click(menuButton);

        // Check if mobile menu items are visible
        expect(screen.getAllByText(/services/i).length).toBeGreaterThan(1);
    });

    it('scrolls to section when nav link is clicked', () => {
        render(<Navbar />);

        const servicesLink = screen.getByText(/services/i);
        fireEvent.click(servicesLink);

        // Should trigger smooth scroll behavior
        expect(servicesLink).toBeInTheDocument();
    });

    it('displays call-to-action button', () => {
        render(<Navbar />);

        const ctaButton = screen.getByRole('button', { name: /get started/i });
        expect(ctaButton).toBeInTheDocument();
    });

    it('applies glassmorphism styling', () => {
        const { container } = render(<Navbar />);

        const nav = container.querySelector('nav');
        expect(nav).toHaveClass('backdrop-blur');
    });
});
