-- Seed Hero Section Content
INSERT INTO `cms_components` (`id`, `key`, `type`, `value`, `description`, `group`, `is_system`) VALUES
(UUID(), 'hero_badge', 'text', 'Habesha Futurism • Digital Excellence', 'Top badge text', 'home', 1),
(UUID(), 'hero_headline_1', 'text', 'Ancient Wisdom', 'First part of main headline', 'home', 1),
(UUID(), 'hero_headline_2', 'text', 'Futuristic Technology', 'Second part of main headline (gradient)', 'home', 1),
(UUID(), 'hero_subheadline', 'text', 'We are G-Nexus — Ethiopia\'s premier digital platform building the future through web, 3D, and AI innovation.', 'Main subtitle text', 'home', 1),
(UUID(), 'hero_cta_1', 'text', 'Start Your Project', 'Primary button text', 'home', 1),
(UUID(), 'hero_cta_2', 'text', 'Explore Platform', 'Secondary button text', 'home', 1),
(UUID(), 'hero_stat_1_value', 'text', '50+', 'First statistic value', 'home', 0),
(UUID(), 'hero_stat_1_label', 'text', 'Projects Delivered', 'First statistic label', 'home', 0),
(UUID(), 'hero_stat_2_value', 'text', '2', 'Second statistic value', 'home', 0),
(UUID(), 'hero_stat_2_label', 'text', 'Expert Founders', 'Second statistic label', 'home', 0),
(UUID(), 'hero_stat_3_value', 'text', '∞', 'Third statistic value', 'home', 0),
(UUID(), 'hero_stat_3_label', 'text', 'Possibilities', 'Third statistic label', 'home', 0)
ON DUPLICATE KEY UPDATE value = VALUES(value);
