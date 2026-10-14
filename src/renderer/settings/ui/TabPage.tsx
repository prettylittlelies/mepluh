import { medalUi } from "../../medal/components";
import type { Children } from "../../medal/types";

interface TabPageProps {
    readonly icon: string;
    readonly title: string;
    readonly description: string;
    readonly children?: Children;
}

export const TabPage = ({ icon, title, description, children }: TabPageProps) => {
    const { Page, Header, Icon } = medalUi().components;
    return (
        <Page>
            <Header icon={<Icon shape={icon} size={64} className="text-foreground-500" />} title={title} description={description} />
            {children}
        </Page>
    );
};
