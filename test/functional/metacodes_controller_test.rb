require 'test_helper'

class MetacodesControllerTest < ActionController::TestCase
  setup do
    @metacode = metacodes(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:metacodes)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create metacode" do
    assert_difference('Metacode.count') do
      post :create, metacode: { icon: @metacode.icon, name: @metacode.name }
    end

    assert_redirected_to metacode_path(assigns(:metacode))
  end

  test "should show metacode" do
    get :show, id: @metacode
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @metacode
    assert_response :success
  end

  test "should update metacode" do
    put :update, id: @metacode, metacode: { icon: @metacode.icon, name: @metacode.name }
    assert_redirected_to metacode_path(assigns(:metacode))
  end

  test "should destroy metacode" do
    assert_difference('Metacode.count', -1) do
      delete :destroy, id: @metacode
    end

    assert_redirected_to metacodes_path
  end
end
