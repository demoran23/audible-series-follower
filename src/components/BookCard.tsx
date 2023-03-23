import { Image } from '@suid/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
} from '@suid/material';
import { Component } from 'solid-js';
import { Book } from 'store/books';
import { formatDistance } from 'date-fns';

export interface BookCardProps {
  book: Book;
}
export const BookCard: Component<BookCardProps> = ({ book }) => {
  const ago =
    book.listenDate &&
    formatDistance(new Date(book.listenDate), Date.now(), {
      addSuffix: true,
    });
  return (
    <Card sx={{ display: 'flex', margin: 1 }}>
      <CardContent sx={{ flex: '1 0 auto' }}>
        <CardMedia
          component="img"
          sx={{ maxWidth: 200 }}
          image={book.imageUrl}
          alt={book.title}
        />
        <Typography
          variant="subtitle1"
          title={book.title}
          noWrap
          sx={{ inlineSize: '200px', fontWeight: 'bold' }}
        >
          {book.title}
        </Typography>
        <Typography variant={'body2'}>{ago}</Typography>
      </CardContent>
    </Card>
  );
};
