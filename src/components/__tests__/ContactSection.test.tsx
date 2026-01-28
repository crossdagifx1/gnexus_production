import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { ContactSection } from '../ContactSection';
import userEvent from '@testing-library/user-event';

describe('ContactSection', () => {
    it('renders the contact form with all fields', () => {
        render(<ContactSection />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('validates email field', async () => {
        const user = userEvent.setup();
        render(<ContactSection />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /send/i });

        // Enter invalid email
        await user.type(emailInput, 'invalid-email');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/valid email/i)).toBeInTheDocument();
        });
    });

    it('requires all fields before submission', async () => {
        render(<ContactSection />);

        const submitButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/required/i)).toBeInTheDocument();
        });
    });

    it('submits form with valid data', async () => {
        const user = userEvent.setup();
        render(<ContactSection />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const messageInput = screen.getByLabelText(/message/i);
        const submitButton = screen.getByRole('button', { name: /send/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(messageInput, 'Test message');

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/thank you/i)).toBeInTheDocument();
        });
    });

    it('displays contact information', () => {
        render(<ContactSection />);

        expect(screen.getByText(/email/i)).toBeInTheDocument();
        expect(screen.getByText(/phone/i)).toBeInTheDocument();
    });
});
