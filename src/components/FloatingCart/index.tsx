import React, { useState, useMemo } from 'react';

import { useNavigation } from '@react-navigation/native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  Container,
  CartPricing,
  CartButton,
  CartButtonText,
  CartTotalPrice,
} from './styles';

import formatValue from '../../utils/formatValue';

import { useCart } from '../../hooks/cart';

interface FloatingCartValue {
  total: number;
}

interface FloatingCartQuantity {
  quantity: number;
}

const FloatingCart: React.FC = () => {
  const { products } = useCart();

  const navigation = useNavigation();

  const cartTotal = useMemo(() => {
    const { total } = products.reduce(
      (accumulator: FloatingCartValue, product) => {
        accumulator.total += product.quantity * product.price;
        return accumulator;
      },
      {
        total: 0,
      },
    );

    return formatValue(total);
  }, [products]);

  const totalItensInCart = useMemo(() => {
    const { quantity } = products.reduce(
      (accumulator: FloatingCartQuantity, product) => {
        accumulator.quantity += product.quantity;
        return accumulator;
      },
      {
        quantity: 0,
      },
    );

    return quantity;
  }, [products]);

  return (
    <Container>
      <CartButton
        testID="navigate-to-cart-button"
        onPress={() => navigation.navigate('Cart')}
      >
        <FeatherIcon name="shopping-cart" size={24} color="#fff" />
        <CartButtonText>{`${totalItensInCart} itens`}</CartButtonText>
      </CartButton>

      <CartPricing>
        <CartTotalPrice>{cartTotal}</CartTotalPrice>
      </CartPricing>
    </Container>
  );
};

export default FloatingCart;
