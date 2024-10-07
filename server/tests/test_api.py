import pytest

from http import HTTPStatus
from tabby_server.__main__ import app

@pytest.fixture()
def client():
    return app.test_client()

@pytest.mark.usefixtures("client")
class TestAPIEndPoint:

    def test_first_funct(self, client):
        # Test Test
        result = client.get('/members')

        assert result.status_code == HTTPStatus.OK

    def test_test(self, client):
        result = client.post('/api/test')

        assert result.status_code == HTTPStatus.OK
