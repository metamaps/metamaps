require 'test_helper'

class MetacodeSetsControllerTest < ActionController::TestCase
  setup do
    @metacode_set = metacode_sets(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:metacode_sets)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create metacode_set" do
    assert_difference('MetacodeSet.count') do
      post :create, metacode_set: { desc: @metacode_set.desc, mapperContributed: @metacode_set.mapperContributed, name: @metacode_set.name }
    end

    assert_redirected_to metacode_set_path(assigns(:metacode_set))
  end

  test "should show metacode_set" do
    get :show, id: @metacode_set
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @metacode_set
    assert_response :success
  end

  test "should update metacode_set" do
    put :update, id: @metacode_set, metacode_set: { desc: @metacode_set.desc, mapperContributed: @metacode_set.mapperContributed, name: @metacode_set.name }
    assert_redirected_to metacode_set_path(assigns(:metacode_set))
  end

  test "should destroy metacode_set" do
    assert_difference('MetacodeSet.count', -1) do
      delete :destroy, id: @metacode_set
    end

    assert_redirected_to metacode_sets_path
  end
end
