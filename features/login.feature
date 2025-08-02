Feature: Login Flow

  Scenario: User is ABLE to login with valid credentials
    Given I open the login page
    When I enter valid credentials
    Then I should be logged in successfully

  Scenario: User is NOT able to login with valid credentials
    Given I open the login page
    When I enter invalid credentials
    Then I should see a login error message
