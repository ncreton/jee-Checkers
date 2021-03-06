package jpa;

import org.apache.commons.lang.RandomStringUtils;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.UserTransaction;

import Exception.*;

/**
 * Created by nicolas on 23/01/2017.
 */
public class GameCheckersDAO {

    @Inject
    EntityManager entityManager;

    @Inject
    UserTransaction userTransaction;

    public GameCheckersAdapter createNewGame(int row, int col, String player1, String player2) throws GameException {
        GameCheckersJPA checkersJPACustom = new GameCheckersJPA(row, col, player1, player2);
        checkersJPACustom.setToken(RandomStringUtils.randomAlphanumeric(10).toLowerCase());
        try{
            userTransaction.begin();
            entityManager.persist(checkersJPACustom);
            userTransaction.commit();
        }catch (Exception e){
            e.printStackTrace();
        }

        return new GameCheckersAdapter(this, checkersJPACustom,row, col, player1, player2);
    }

    public GameCheckersAdapter createNewGame() throws GameException {
        return this.createNewGame(10,10,"Player 1", "Player 2");
    }

    public GameCheckersAdapter loadFromToken(String token) throws GameException {
        GameCheckersJPA checkersJPA = (GameCheckersJPA) entityManager
                .createQuery("SELECT g FROM Game g WHERE g.token = :token")
                .setParameter("token", token)
                .getSingleResult();

        return new GameCheckersAdapter(this, checkersJPA, checkersJPA.getRowSize(), checkersJPA.getColSize(), checkersJPA.getPlayer1Name(), checkersJPA.getPlayer2Name());
    }

    public void saveGame(GameCheckersJPA checkersJPA){
        try {
            userTransaction.begin();
            entityManager.merge(checkersJPA);
            userTransaction.commit();
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    public void deleteGame(GameCheckersJPA checkersJPA){
        try{
            userTransaction.begin();
            entityManager.remove(checkersJPA);
            userTransaction.commit();
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    public void deleteFromToken(String token){
        GameCheckersJPA checkersJPA = (GameCheckersJPA) entityManager
                .createQuery("SELECT g FROM Game g WHERE g.token = :token")
                .setParameter("token", token)
                .getSingleResult();

        deleteGame(checkersJPA);
    }
}
