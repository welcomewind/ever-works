import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import styles from './styles.module.css';
function getFeatureList() {
    return [
        {
            title: translate({
                id: 'homepage.features.build.title',
                message: 'Build a Work in minutes',
                description: 'Homepage feature title for creating a work'
            }),
            description: translate({
                id: 'homepage.features.build.description',
                message: 'Describe what you want and Ever Works researches, generates and deploys the site for you.',
                description: 'Homepage feature description for creating a work'
            }),
            href: '/getting-started'
        },
        {
            title: translate({
                id: 'homepage.features.own.title',
                message: 'Own the content and the code',
                description: 'Homepage feature title for owning content and code'
            }),
            description: translate({
                id: 'homepage.features.own.description',
                message: 'Every Work is backed by a Git repository you control, so nothing is locked inside a vendor.',
                description: 'Homepage feature description for owning content and code'
            }),
            href: '/architecture'
        },
        {
            title: translate({
                id: 'homepage.features.extend.title',
                message: 'Extend it with plugins',
                description: 'Homepage feature title for the plugin system'
            }),
            description: translate({
                id: 'homepage.features.extend.description',
                message: 'AI providers, search, deployment and pipelines are plugins — swap them or write your own.',
                description: 'Homepage feature description for the plugin system'
            }),
            href: '/plugin-system/'
        }
    ];
}
function Feature({ title, description, href }) {
    return (<div className={clsx('col col--4')}>
			<div className="text--center padding-horiz--md">
				<Heading as="h3">
					<Link to={href}>{title}</Link>
				</Heading>
				<p>{description}</p>
			</div>
		</div>);
}
export default function HomepageFeatures() {
    return (<section className={styles.features}>
			<div className="container">
				<div className="row">
					{getFeatureList().map((props, idx) => (<Feature key={idx} {...props}/>))}
				</div>
			</div>
		</section>);
}
