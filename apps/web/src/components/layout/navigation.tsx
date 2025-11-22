import { Link } from "@tanstack/react-router";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "src/components/ui/navigation-menu";
import { cn } from "src/components/ui/utils";

const navigationItems = [
	{ name: "Home", href: "/" },
	{ name: "Counter Examples", href: "/count" },
	{ name: "Messages", href: "/messages" },
];

export function MainNavigation() {
	return (
		<div className="border-b">
			<div className="container flex h-16 items-center">
				<NavigationMenu>
					<NavigationMenuList>
						{navigationItems.map((item) => (
							<NavigationMenuItem key={item.name}>
								<Link to={item.href} className={navigationMenuTriggerStyle()}>
									{item.name}
								</Link>
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</div>
	);
}
