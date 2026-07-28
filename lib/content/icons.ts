import {
  IconBolt,
  IconBrandWhatsapp,
  IconCash,
  IconChartBar,
  IconCheck,
  IconClockBolt,
  IconClockHour4,
  IconDeviceMobile,
  IconGift,
  IconHeadset,
  IconLayoutGrid,
  IconLock,
  IconMessage2,
  IconMessages,
  IconPackage,
  IconPlugConnected,
  IconRobot,
  IconRocket,
  IconSettings,
  IconShieldCheck,
  IconShoppingCart,
  IconSparkles,
  IconStack2,
  IconTrendingUp,
  IconUserPlus,
  IconUsers,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";

/**
 * Icons an admin may pick for a content box.
 *
 * The database stores the *name*, so rendering has to map it back to a
 * component. Doing that through a fixed table rather than a dynamic import
 * keeps the bundle predictable and means a bad value in the database can only
 * ever fall back to the default — it can never inject anything.
 */
export const ICONS: Record<string, Icon> = {
  IconSparkles,
  IconBolt,
  IconRobot,
  IconMessage2,
  IconMessages,
  IconPlugConnected,
  IconBrandWhatsapp,
  IconClockHour4,
  IconClockBolt,
  IconTrendingUp,
  IconUserPlus,
  IconUsers,
  IconShoppingCart,
  IconPackage,
  IconCash,
  IconChartBar,
  IconLayoutGrid,
  IconHeadset,
  IconShieldCheck,
  IconLock,
  IconWorld,
  IconDeviceMobile,
  IconRocket,
  IconGift,
  IconSettings,
  IconCheck,
  IconStack2,
};

export const ICON_NAMES = Object.keys(ICONS);

/** Resolve a stored icon name, falling back to a safe default. */
export function resolveIcon(name: string | null | undefined): Icon {
  return (name && ICONS[name]) || IconSparkles;
}
