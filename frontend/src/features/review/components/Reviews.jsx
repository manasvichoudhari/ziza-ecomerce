import { Button, LinearProgress, Rating, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react'; // useMemo imported
import { useDispatch, useSelector } from 'react-redux';
import { createReviewAsync, selectReviewAddStatus, selectReviewDeleteStatus, selectReviewUpdateStatus, selectReviews } from '../ReviewSlice';
import { ReviewItem } from './ReviewItem';
import { useForm } from 'react-hook-form';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import CreateIcon from '@mui/icons-material/Create';
import {  motion } from 'framer-motion';

export const Reviews = ({ productId, averageRating }) => {
    const dispatch = useDispatch();
    const reviews = useSelector(selectReviews);
    const [value] = useState(1);
    const {  handleSubmit} = useForm();
    const loggedInUser = useSelector(selectLoggedInUser);

    const reviewAddStatus = useSelector(selectReviewAddStatus);
    const reviewDeleteStatus = useSelector(selectReviewDeleteStatus);
    const reviewUpdateStatus = useSelector(selectReviewUpdateStatus);

    const [writeReview, setWriteReview] = useState(false);
    const theme = useTheme();

    const is840 = useMediaQuery(theme.breakpoints.down(840));
    const is480 = useMediaQuery(theme.breakpoints.down(480));

    // This logic for useEffect is fine, no changes needed here.
    useEffect(() => { /* ... your toast effects ... */ }, [reviewAddStatus]);
    useEffect(() => { /* ... your toast effects ... */ }, [reviewDeleteStatus]);
    useEffect(() => { /* ... your toast effects ... */ }, [reviewUpdateStatus]);
    useEffect(() => { /* ... your cleanup effect ... */ }, []);

    // FIX #3: Using useMemo for efficient calculation
    const ratingCounts = useMemo(() => {
        return reviews?.reduce((acc, review) => {
            if (review && review.rating) {
                acc[review.rating] = (acc[review.rating] || 0) + 1;
            }
            return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    }, [reviews]);
    
    const handleAddReview = (data) => {
        const review = { ...data, rating: value, user: loggedInUser._id, product: productId };
        dispatch(createReviewAsync(review));
        setWriteReview(false);
    };

    return (
        <Stack rowGap={5} alignSelf={"flex-start"} width={is480 ? "90vw" : is840 ? "25rem" : '40rem'}>
            <Stack>
                <Typography gutterBottom variant='h4' fontWeight={400}>Reviews</Typography>
                {reviews?.length ? (
                    <Stack rowGap={3}>
                        <Stack rowGap={1}>
                            <Typography variant='h2' fontWeight={800}>{averageRating}.0</Typography>
                            <Rating readOnly value={averageRating} />
                            <Typography variant='h6' color={'text.secondary'}>Based on {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}</Typography>
                        </Stack>
                        <Stack rowGap={2}>
                            {[5, 4, 3, 2, 1].map((number) => {
                                // FIX #2: Check for reviews.length to prevent division by zero
                                const percentage = reviews.length > 0 ? (ratingCounts[number] / reviews.length) * 100 : 0;
                                return (
                                    <Stack key={number} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} columnGap={1}>
                                        <Typography sx={{ whiteSpace: "nowrap" }}>{number} star</Typography>
                                        <LinearProgress sx={{ width: "100%", height: "1rem", borderRadius: "4px" }} variant='determinate' value={percentage} />
                                        <Typography>{Math.round(percentage)}%</Typography>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Stack>
                ) : (
                    <Typography variant='h6' color={'text.secondary'} fontWeight={400}>{loggedInUser?.isAdmin ? "There are no reviews currently" : "Be the one to post review first"}</Typography>
                )}
            </Stack>

            {/* Reviews mapping */}
            <Stack rowGap={2}>
                {/* FIX #1: Filter out bad data and use Optional Chaining (?.) to prevent crashes */}
                {reviews && reviews
                    .filter(review => review && review.user) // First, remove reviews with null users
                    .map((review) => (
                        <ReviewItem
                            key={review._id}
                            id={review._id}
                            userid={review.user._id} // Safe to access now
                            comment={review.comment}
                            createdAt={review.createdAt}
                            rating={review.rating}
                            username={review.user.name} // Safe to access now
                        />
                    ))
                }
            </Stack>

            {/* Add review form - no major changes needed here */}
            {writeReview ? (
                 <Stack rowGap={3} position={'relative'} component={'form'} noValidate onSubmit={handleSubmit(handleAddReview)}>
                    {/* ... your form JSX ... */}
                 </Stack>
            ) : (
                !loggedInUser?.isAdmin && (
                    <motion.div onClick={() => setWriteReview(!writeReview)} whileHover={{ scale: 1.050 }} whileTap={{ scale: 1 }} style={{ width: "fit-content" }}>
                        <Button disableElevation size={is480 ? "medium" : 'large'} variant='contained' sx={{ color: theme.palette.primary.light, textTransform: "none", fontSize: "1rem", borderRadius: '6px' }} startIcon={<CreateIcon />}>Write a review</Button>
                    </motion.div>
                )
            )}
        </Stack>
    );
};