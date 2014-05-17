require 'test_helper'

class InMetacodeSetsControllerTest < ActionController::TestCase
  setup do
    @in_metacode_set = in_metacode_sets(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:in_metacode_sets)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create in_metacode_set" do
    assert_difference('InMetacodeSet.count') do
      post :create, in_metacode_set: {  }
    end

    assert_redirected_to in_metacode_set_path(assigns(:in_metacode_set))
  end

  test "should show in_metacode_set" do
    get :show, id: @in_metacode_set
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @in_metacode_set
    assert_response :success
  end

  test "should update in_metacode_set" do
    put :update, id: @in_metacode_set, in_metacode_set: {  }
    assert_redirected_to in_metacode_set_path(assigns(:in_metacode_set))
  end

  test "should destroy in_metacode_set" do
    assert_difference('InMetacodeSet.count', -1) do
      delete :destroy, id: @in_metacode_set
    end

    assert_redirected_to in_metacode_sets_path
  end
end
