import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    isFetching: false,
    error: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isFetching = false;
      state.error = false;
    },
    loginFail: (state, action) => {
      state.user = null;
      state.isFetching = false;
      state.error = action.payload;
    },
    resetState: (state) => {
      state.user = null;
      state.isFetching = false;
      state.error = false;
    },
    followUser: (state, action) => {
      return {
        ...state,
        user: {
          ...state.user,
          followings: [...state.user.followings, action.payload]
        }
      };
    }, 
    unFollowUser: (state, action) => {
      return {
        ...state,
        user: {
          ...state.user,
          followings: state.user.followings.filter(following => following !== action.payload)
        }
      };
    }
  },
})

export const { loginSuccess, loginFail, resetState, followUser, unFollowUser } = userSlice.actions

export const updateUser = (userData) => async (dispatch) => {
  try {
    dispatch(loginSuccess(userData));
  } catch (err) {
    dispatch(loginFail(err));
  }
};

export default userSlice.reducer
