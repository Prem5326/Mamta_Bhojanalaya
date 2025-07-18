import React from 'react';
import Banner from './HomeComponent/Banner';
import TopItem from './HomeComponent/TopItem';
import ChefSays from './HomeComponent/ChefSays';
import HomePageShortMenu from './HomeComponent/HomePageShortMenu';
import HomePageContacts from './HomeComponent/HomePageContacts';
import ChefRecomended from './HomeComponent/ChefRecomended';
import Highlighted from './HomeComponent/Highlighted';
import Reviews from './HomeComponent/Reviews';
import { Helmet } from 'react-helmet-async';
import useMenu from '../../Hooks/useMenu';

const Homepage = () => {
    const [menu, , , , , , , , loading] = useMenu();

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <span className="loading loading-spinner w-16 md:w-24 text-warning"></span>
            </div>
        );
    }

    if (!menu || menu.length === 0) {
        return (
            <div className="text-center mt-20 text-red-500">
                Menu could not be loaded. Please try again later.
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Home || Mamta Bhojnalaya Restaurant</title>
            </Helmet>
            <Banner />
            <TopItem />
            <ChefSays />
            <HomePageShortMenu />
            <HomePageContacts />
            <ChefRecomended />
            <Highlighted />
            <Reviews />
        </>
    );
};

export default Homepage;
