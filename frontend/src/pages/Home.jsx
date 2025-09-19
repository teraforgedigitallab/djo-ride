import {
    Hero,
    LogoCloud,
    Features,
    HowItWorks,
    FAQ,
    CTA
} from '../sections';

const Home = () => {
    return (
        <>
            <Hero />
            {/* <LogoCloud /> */}
            <Features />
            <HowItWorks />
            {/* <Testimonials /> */}
            <FAQ />
            <CTA />
        </>
    );
};

export default Home;