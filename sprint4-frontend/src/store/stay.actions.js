import { stayService } from "../services/stay.service.js";
import { userService } from "../services/user.service.js";
import { store } from "./store.js";
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js";
import {
  ADD_STAY,
  ADD_TO_CART,
  CLEAR_CART,
  REMOVE_STAY,
  REMOVE_FROM_CART,
  SET_STAYS,
  UNDO_REMOVE_STAY,
  UPDATE_STAY,
  SET_IS_LOADING,
  // SET_SELECTED_DATES,
  // SET_GUESTS_NUMBER,
} from "./stay.reducer.js";
import { SET_SCORE, SET_USERS } from "./user.reducer.js";
import { SET_FILTER_BY } from "./stay.reducer.js";

// Action Creators:
export function getActionRemoveStay(stayId) {
  const filterBy = store.getState().stayModule.filterBy;

  return {
    type: REMOVE_STAY,
    stayId,
  };
}
export function getActionAddStay(stay) {
  return {
    type: ADD_STAY,
    stay,
  };
}
export function getActionUpdateStay(stay) {
  return {
    type: UPDATE_STAY,
    stay,
  };
}

export async function loadStay() {
  setIsLoading();
  const filterBy = store.getState().stayModule.filterBy;
  try {
    const stays = await stayService.query(filterBy);
    store.dispatch({
      type: SET_STAYS,
      stays,
    });
  } catch (err) {
    console.log("Cannot load stays", err);
    throw err;
  } finally {
    store.dispatch({ type: SET_IS_LOADING, isLoading: false });
  }
}

export function setSelectedDates(selectedDates) {
  return {
    type: SET_FILTER_BY,
    filterBy: { selectedDates }
  };
}

export function setSelectedDestination(selectedDestination) {
  return {
    type: SET_FILTER_BY,
    filterBy: { selectedDestination }
  }
}

export function setSelectedGuests(selectedGuests) {
  return {
    type: SET_FILTER_BY,
    filterBy: { selectedGuests }
  };
}

export async function removeStay(stayId) {
  try {
    await stayService.remove(stayId);
    store.dispatch(getActionRemoveStay(stayId));
  } catch (err) {
    console.log("Cannot remove stay", err);
    throw err;
  }
}

export async function addStay(stay) {
  try {
    const savedStay = await stayService.save(stay);
    console.log("Added stay", savedStay);
    store.dispatch(getActionAddStay(savedStay));
    return savedStay;
  } catch (err) {
    console.log("Cannot add stay", err);
    throw err;
  }
}

export function updateStay(stay) {
  return stayService
    .save(stay)
    .then((savedStay) => {
      console.log("Updated stay:", savedStay);
      store.dispatch(getActionUpdateStay(savedStay));
      return savedStay;
    })
    .catch((err) => {
      console.log("Cannot save stay", err);
      throw err;
    });
}

export function addToCart(stay) {
  store.dispatch({
    type: ADD_TO_CART,
    stay,
  });
}

export function removeFromCart(stayId) {
  store.dispatch({
    type: REMOVE_FROM_CART,
    stayId,
  });
}

export async function checkout(total) {
  try {
    const score = await userService.changeScore(-total);
    store.dispatch({ type: SET_SCORE, score });
    store.dispatch({ type: CLEAR_CART });
    return score;
  } catch (err) {
    console.log("stayActions: err in checkout", err);
    throw err;
  }
}

// Demo for Optimistic Mutation
// (IOW - Assuming the server call will work, so updating the UI first)
export function onRemovestayOptimistic(stayId) {
  store.dispatch({
    type: REMOVE_STAY,
    stayId,
  });
  showSuccessMsg("stay removed");

  stayService
    .remove(stayId)
    .then(() => {
      console.log("Server Reported - Deleted Succesfully");
    })
    .catch((err) => {
      showErrorMsg("Cannot remove stay");
      console.log("Cannot load stays", err);
      store.dispatch({
        type: UNDO_REMOVE_STAY,
      });
    });
}

export function setIsLoading() {
  store.dispatch({ type: SET_IS_LOADING, isLoading: true });
}

export function setFilterBy(filterBy) {
  store.dispatch({ type: SET_FILTER_BY, filterBy });
}
