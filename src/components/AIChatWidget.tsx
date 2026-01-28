import { useLocation } from 'react-router-dom';
import AIChatWidgetContent from './AIChatWidgetContent';

export default function AIChatWidget() {
    const location = useLocation();

    // Hide widget on Chat and Agent pages
    if (['/chat', '/agent'].includes(location.pathname)) {
        return null;
    }

    return <AIChatWidgetContent />;
}
