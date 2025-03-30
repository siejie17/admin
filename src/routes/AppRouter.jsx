import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../layout/AppLayout";
import EventListingPage from "../pages/events/EventListingPage";
import MerchandiseListingPage from "../pages/merchandise/MerchandiseListingPage";

const AppRouter = () => (
    <Routes>
        <Route element={<AppLayout />}>
            {/* Events Routes */}
            <Route path="/events" element={<EventListingPage />} />
            {/* <Route path="/events/details" element={<EventDetailPage />} /> */}

            {/* Merchandise Routes */}
            <Route path="/merchandise" element={<MerchandiseListingPage />} />
            {/* <Route path="/merchandise/details" element={<MerchandiseDetailPage />} /> */}
        </Route>

        <Route path="*" element={<Navigate to="/events" />} />
    </Routes>
);

export default AppRouter;